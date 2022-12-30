/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { BlockEntity, IBlock } from '../../entities';
import { ListBlockCreatedParams } from '../../types';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleBlockService extends Service {
	// Private _consumer = this.broker.nodeID;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-block',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbBlockMixin],
			queues: {
				'handle.block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// // @ts-ignore
						// Await this.handleJob();
						// @ts-ignore
						await this.handleBlock(job.data.block);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleBlock(block: IBlock) {
		const jsonConvert: JsonConvert = new JsonConvert();
		// JsonConvert.operationMode = OperationMode.LOGGING;
		const blockEntity: BlockEntity = jsonConvert.deserializeObject(block, BlockEntity);
		const listFoundBlock: BlockEntity[] = await this.adapter.find({
			query: {
				'block_id.hash': blockEntity.block_id?.hash,
			},
		});

		const listTx = blockEntity.block?.data?.txs;
		if (listTx && listTx.length > 0) {
			this.createJob(
				'crawl.transaction',
				{
					listTx,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
				},
			);
		}
		this.logger.info(`Found ${listFoundBlock.length} blocks in db`);
		if (listFoundBlock.length === 0) {
			const listId = await this.adapter.insert(blockEntity);
			this.broker.emit('list-block.upserted', {
				listBlock: [block],
				chainId: Config.CHAIN_ID,
			} as ListBlockCreatedParams);
			return listId;
		}
		return null;
	}

	public async _start() {
		this.getQueue('handle.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('handle.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
