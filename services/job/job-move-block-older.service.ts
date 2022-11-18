/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { IBlock } from '../../entities';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { ObjectId } from 'bson';
import { QueueConfig } from '../../config/queue';

export default class MoveBlockService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'moveblock',
			version: 1,
			mixins: [QueueService(QueueConfig.redis, QueueConfig.opts), dbBlockMixin],
			queues: {
				'move.block': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJobMoveBlock();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJobMoveBlock() {
		const oldestBlock: IBlock[] = await this.adapter.lean({
			sort: '_id',
			limit: 10,
		});

		let handleBlock: IBlock[] = [];
		oldestBlock.map((block: IBlock) => {
			let blockTime = block.block?.header?.time;
			if (blockTime) {
				let timeRange = new Date();
				timeRange.setDate(blockTime.getDate() + parseInt(Config.RANGE_DAY_MOVE_BLOCK, 10));
				if (timeRange <= new Date()) {
					handleBlock.push(block);
				}
			}
		});
		// insert block to block-aggregate table
		this.createJob(
			'listblock.insert',
			{
				listBlock: handleBlock,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
			},
		);
		//delete block in block table
		let listBulk: any[] = [];
		listBulk = handleBlock.map((block) => {
			return {
				deleteOne: {
					filter: {
						//@ts-ignore
						_id: new ObjectId(block._id.toString()),
					},
				},
			};
		});
		let resultDeleteBlock = await this.adapter.bulkWrite(listBulk);
		this.logger.info('Result delete block: ', resultDeleteBlock);

		//create job move tx older
		const handleBlockHeight = handleBlock.map((block: IBlock) => {
			return block.block?.header?.height;
		});
		this.createJob(
			'move.tx',
			{
				listBlockHeight: handleBlockHeight,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
			},
		);

		if (oldestBlock.length && handleBlock.length && oldestBlock.length == handleBlock.length) {
			this.createJob(
				'move.block',
				{},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 3,
					},
				},
			);
		}
	}

	async _start() {
		this.createJob(
			'move.block',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
			},
		);
		this.getQueue('move.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('move.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
