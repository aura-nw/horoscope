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

export default class MoveBlockService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'moveblock',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'move.block',
					},
				),
				dbBlockMixin,
			],
			queues: {
				'move.block': {
					concurrency: 10,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.lastId);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(lastId: string) {
		let blockLastId: any = null;
		if (lastId == '0') {
			const lastestBlockAggregate: IBlock[] = await this.adapter.find({
				sort: '_id',
				limit: 1,
				skip: 0,
			});
			if (lastestBlockAggregate.length && lastestBlockAggregate[0]._id) {
				blockLastId = lastestBlockAggregate[0];
				let timestampObjectId = new ObjectId(
					lastestBlockAggregate[0]._id.toString(),
				).getTimestamp();

				timestampObjectId.setDate(
					timestampObjectId.getDate() + parseInt(Config.RANGE_DAY_MOVE_BLOCK, 10),
				);

				if (timestampObjectId >= new Date()) {
					return;
				}

				lastId = lastestBlockAggregate[0]._id.toString();
			}
		}

		let listBlock: IBlock[] = await this.adapter.find({
			query: {
				_id: { $gt: new ObjectId(lastId) },
			},
			limit: 100,
			offset: 0,
			sort: '_id',
		});
		if (blockLastId) {
			listBlock.unshift(blockLastId);
		}
		if (listBlock.length > 0) {
			try {
				this.createJob(
					'move.block',
					{
						//@ts-ignore
						lastId: listBlock[listBlock.length - 1]._id.toString(),
					},
					{
						removeOnComplete: true,
					},
				);

				this.broker.emit('job.moveblock', { listBlock: listBlock });
				let listBulk: any[] = [];
				listBulk = listBlock.map((block: IBlock) => {
					return {
						deleteOne: {
							filter: {
								_id: block._id,
							},
						},
					};
				});
				let result = await this.adapter.bulkWrite(listBulk);
				this.logger.debug(result);
				if (listBlock) {
					//@ts-ignore
					this.lastId = listBlock[listBlock.length - 1]._id.toString();
				}
				this.broker.emit('move.block.success', {
					listBlock: listBlock,
				});
			} catch (error) {
				this.logger.error(`error: ${error}`);
			}
		}
	}

	async _start() {
		this.createJob(
			'move.block',
			{
				lastId: '0',
			},
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('move.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('move.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
