/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Service, ServiceBroker } from 'moleculer';

import { Job } from 'bull';
import { ObjectId } from 'bson';
import { IBlock } from '../../entities';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
import { Config } from '../../common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class MoveBlockService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'moveblock',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbBlockMixin],
			queues: {
				'move.block': {
					concurrency: 1,
					process: (job: Job) => {
						job.progress(10);
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
			sort: 'block.header.height',
			limit: 10,
		});

		const handleBlock: IBlock[] = [];
		oldestBlock.map((block: IBlock) => {
			const blockTime = block.block?.header?.time;
			if (blockTime) {
				const timeRange = blockTime;
				const RANGE_DAY_MOVE_BLOCK = parseInt(Config.RANGE_DAY_MOVE_BLOCK, 10);
				timeRange.setDate(timeRange.getDate() + RANGE_DAY_MOVE_BLOCK);
				if (timeRange <= new Date()) {
					handleBlock.push(block);
				}
			}
		});
		// Insert block to block-aggregate table
		if (handleBlock.length > 0) {
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

			// Delete block in block table
			let listBulk: any[] = [];
			listBulk = handleBlock.map((block) => ({
				deleteOne: {
					filter: {
						_id: new ObjectId(block?._id?.toString()),
					},
				},
			}));
			if (listBulk.length > 0) {
				const resultDeleteBlock = await this.adapter.bulkWrite(listBulk);
				this.logger.info('Result delete block: ', resultDeleteBlock);
			}
			// Create job move tx older
			const handleBlockHeight = handleBlock.map(
				(block: IBlock) => block.block?.header?.height,
			);
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

			if (
				oldestBlock.length &&
				handleBlock.length &&
				oldestBlock.length === handleBlock.length
			) {
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
	}

	public async _start() {
		this.createJob(
			'move.block',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					cron: Config.CRON_JOB_MOVE_BLOCK,
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
