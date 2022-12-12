/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Context, ServiceBroker } from 'moleculer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { ObjectId } from 'bson';
import { ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class MoveTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'movetx',
			version: 1,
			mixins: [
				queueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'move.tx',
					},
				),
				dbTransactionMixin,
			],
			queues: {
				'move.tx': {
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
		let txLastId: any = null;
		if (lastId === '0') {
			const lastestTxAggregate: ITransaction[] = await this.adapter.find({
				sort: '_id',
				limit: 1,
				skip: 0,
			});
			if (lastestTxAggregate.length && lastestTxAggregate[0]._id) {
				txLastId = lastestTxAggregate[0];
				const timestampObjectId = new ObjectId(
					lastestTxAggregate[0]._id.toString(),
				).getTimestamp();

				const timeRange = new Date();
				timeRange.setDate(
					timestampObjectId.getDate() + parseInt(Config.RANGE_DAY_MOVE_TX, 10),
				);
				if (timeRange >= new Date()) {
					this.createJob(
						'move.tx',
						{
							lastId,
						},
						{
							removeOnComplete: true,
							removeOnFail: {
								count: 10,
							},
							delay: new Date().getTime() - timestampObjectId.getTime(),
						},
					);
					return;
				}

				lastId = lastestTxAggregate[0]._id.toString();
			}
		} else {
			const timestampObjectId = new ObjectId(lastId).getTimestamp();

			const timeRange = new Date();
			timeRange.setDate(timestampObjectId.getDate() + parseInt(Config.RANGE_DAY_MOVE_TX, 10));
			if (timeRange >= new Date()) {
				this.createJob(
					'move.tx',
					{
						lastId,
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 10,
						},
						delay: new Date().getTime() - timestampObjectId.getTime(),
					},
				);
				return;
			}
		}
		const listTx: ITransaction[] = await this.adapter.find({
			query: {
				_id: { $gt: new ObjectId(lastId) },
			},
			limit: 100,
			offset: 0,
			sort: '_id',
		});
		if (txLastId) {
			listTx.unshift(txLastId);
		}
		if (listTx.length > 0) {
			try {
				this.createJob(
					'move.tx',
					{
						// @ts-ignore
						lastId: listTx[listTx.length - 1]._id.toString(),
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 10,
						},
					},
				);

				this.broker.emit('job.movetx', { listTx });
				let listBulk: any[] = [];
				listBulk = listTx.map((tx: ITransaction) =>
					// Return this.adapter.removeById(tx._id);
					({
						deleteOne: {
							filter: {
								_id: tx._id,
							},
						},
					}),
				);
				// Await Promise.all(listPromise);
				await this.adapter.bulkWrite(listBulk);
				if (listTx) {
					// @ts-ignore
					this.lastId = listTx[listTx.length - 1]._id.toString();
				}
				this.broker.emit('move.tx.success', {
					listTx,
				});
			} catch (error) {
				this.logger.error(`error: ${error}`);
			}
		}
	}

	public async _start() {
		this.createJob(
			'move.tx',
			{
				lastId: '0',
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
			},
		);
		this.getQueue('move.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('move.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
