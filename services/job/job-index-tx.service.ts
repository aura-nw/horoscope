/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { IAttribute, IEvent, ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { ObjectId } from 'bson';
import { toBase64, toUtf8, fromBase64, fromUtf8 } from '@cosmjs/encoding';
import RedisMixin from '../../mixins/redis/redis.mixin';
export default class IndexTxService extends Service {
	private redisMixin = new RedisMixin().start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'indextx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'index.tx',
					},
				),
				dbTransactionMixin,
				this.redisMixin,
			],
			queues: {
				'index.tx': {
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
		let query = { indexes: { $eq: null } };
		if (lastId == '0') {
		} else {
			const query = {
				_id: { $gt: new ObjectId(lastId) },
				'indexes.timestamp': { $eq: null },
			};
		}
		const listTx: ITransaction[] = await this.adapter.find({
			query: query,
			sort: '_id',
			limit: 100,
			skip: 0,
		});
		if (listTx.length > 0) {
			this.createJob(
				'index.tx',
				{
					//@ts-ignore
					lastId: listTx[listTx.length - 1]._id.toString(),
				},
				{
					removeOnComplete: true,
				},
			);
		}
		// const [tx, nextTx]: [ITransaction, ITransaction] = await Promise.all([
		// 	this.adapter.findOne({
		// 		_id: new ObjectId(lastId),
		// 	}),
		// 	this.adapter.findOne({
		// 		_id: { $gt: new ObjectId(lastId) },
		// 	}),
		// ]);

		// if (nextTx) {
		// 	this.createJob(
		// 		'index.tx',
		// 		{
		// 			//@ts-ignore
		// 			lastId: lastId,
		// 		},
		// 		{
		// 			removeOnComplete: true,
		// 		},
		// 	);
		// }

		if (listTx) {
			let listBulk: any[] = [];
			listTx.map((tx: ITransaction) => {
				let indexes: any = {};
				indexes['timestamp'] = tx.tx_response.timestamp;
				indexes['height'] = tx.tx_response.height;
				tx.tx_response.events.map((event: IEvent) => {
					let type = event.type.toString();
					let attributes = event.attributes;
					attributes.map((attribute: IAttribute) => {
						try {
							let key = fromUtf8(fromBase64(attribute.key.toString()));
							let value = attribute.value
								? fromUtf8(fromBase64(attribute.value.toString()))
								: '';
							let array = indexes[`${type}.${key}`];
							if (array && array.length > 0) {
								let position = indexes[`${type}.${key}`].indexOf(value);
								if (position == -1) {
									indexes[`${type}.${key}`].push(value);
								}
							} else {
								indexes[`${type}_${key}`] = [value];
							}

							let hashValue = this.redisClient
								.hGet(`att-${type}`, key)
								.then((value: any) => {
									if (value) {
										this.redisClient.hSet(
											`att-${type}`,
											key,
											Number(value) + 1,
										);
									} else {
										this.redisClient.hSet(`att-${type}`, key, 1);
									}
								});
						} catch (error) {
							this.logger.info(tx._id);
							this.logger.error(error);
						}
					});
				});
				// this.logger.info(indexes);
				this.logger.info('add indexes to id: ', tx._id);
				listBulk.push({
					updateOne: {
						filter: {
							_id: tx._id,
						},
						update: {
							indexes: indexes,
						},
					},
				});
			});
			let result = await this.adapter.bulkWrite(listBulk);
			// let result = await this.adapter.updateById(tx._id, {
			// 	$set: {
			// 		indexes: indexes,
			// 	},
			// });
			this.logger.debug('Result: ', JSON.stringify(result));
		}
	}

	async _start() {
		this.redisClient = await this.getRedisClient();
		this.createJob(
			'index.tx',
			{
				lastId: '0',
			},
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('index.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('index.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
