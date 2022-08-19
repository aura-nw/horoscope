/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { IBlock, ITransaction, TransactionEntity } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { ObjectId } from 'bson';
import { Types } from 'mongoose';

export default class MoveTxService extends Service {
	// private lastId: string = '0';
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'movetx',
			version: 1,
			mixins: [
				QueueService(
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

	// async initEnv() {
	// 	if this.lastId === null {
	// }
	async handleJob(lastId: string) {
		let txLastId: any = null;
		if (lastId == '0') {
			const lastestTxAggregate: ITransaction[] = await this.adapter.find({
				sort: '_id',
				limit: 1,
				skip: 0,
			});
			if (lastestTxAggregate.length && lastestTxAggregate[0]._id) {
				txLastId = lastestTxAggregate[0];
				let timestampObjectId = new ObjectId(
					lastestTxAggregate[0]._id.toString(),
				).getTimestamp();

				timestampObjectId.setDate(
					timestampObjectId.getDate() + parseInt(Config.RANGE_DAY_MOVE_TX, 10),
				);

				if (timestampObjectId >= new Date()) {
					return;
				}

				lastId = lastestTxAggregate[0]._id.toString();
			}
		}
		let listTx: ITransaction[] = await this.adapter.find({
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
						//@ts-ignore
						lastId: listTx[listTx.length - 1]._id.toString(),
					},
					{
						removeOnComplete: true,
					},
				);

				this.broker.emit('job.movetx', { listTx: listTx });
				let listBulk: any[] = [];
				listBulk = listTx.map((tx: ITransaction) => {
					// return this.adapter.removeById(tx._id);
					return {
						deleteOne: {
							filter: {
								_id: tx._id,
							},
						},
					};
				});
				// await Promise.all(listPromise);
				await this.adapter.bulkWrite(listBulk);
				if (listTx) {
					//@ts-ignore
					this.lastId = listTx[listTx.length - 1]._id.toString();
				}
				this.broker.emit('move.tx.success', {
					listTx: listTx,
				});
			} catch (error) {
				this.logger.error(`error: ${error}`);
			}
		}
	}

	async _start() {
		this.createJob(
			'move.tx',
			{
				lastId: '0',
			},
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('move.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('move.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
