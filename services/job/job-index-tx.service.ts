/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ObjectId } from 'bson';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
import { IAttribute, IEvent, ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import RedisMixin from '../../mixins/redis/redis.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
export default class IndexTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'indextx',
			version: 1,
			mixins: [
				queueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'index.tx',
					},
				),
				dbTransactionMixin,
				new RedisMixin().start(),
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
		const query: any = {};
		if (lastId !== '0') {
			query._id = { $gt: new ObjectId(lastId) };
		}
		query.indexes = { $eq: null };
		const listTx: ITransaction[] = await this.adapter.find({
			query,
			sort: '_id',
			limit: 100,
			skip: 0,
		});
		if (listTx.length > 0) {
			this.createJob(
				'index.tx',
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
		}
		// Const [tx, nextTx]: [ITransaction, ITransaction] = await Promise.all([
		// 	This.adapter.findOne({
		// 		_id: new ObjectId(lastId),
		// 	}),
		// 	This.adapter.findOne({
		// 		_id: { $gt: new ObjectId(lastId) },
		// 	}),
		// ]);

		// If (nextTx) {
		// 	This.createJob(
		// 		'index.tx',
		// 		{
		// 			//@ts-ignore
		// 			LastId: lastId,
		// 		},
		// 		{
		// 			RemoveOnComplete: true,
		// 		},
		// 	);
		// }

		if (listTx) {
			const listBulk: any[] = [];
			listTx.map((tx: ITransaction) => {
				const indexes: any = {};
				indexes.timestamp = tx.tx_response.timestamp;
				indexes.height = tx.tx_response.height;
				tx.tx_response.events.map((event: IEvent) => {
					let type = event.type.toString();
					type = type.replace(/\./g, '_');
					const attributes = event.attributes;
					attributes.map((attribute: IAttribute) => {
						try {
							let key = fromUtf8(fromBase64(attribute.key.toString()));
							let value = attribute.value
								? fromUtf8(fromBase64(attribute.value.toString()))
								: '';
							key = key.replace(/\./g, '_');
							value = value.replace(/\./g, '_');
							const array = indexes[`${type}_${key}`];
							if (array && array.length > 0) {
								const position = indexes[`${type}_${key}`].indexOf(value);
								if (position === -1) {
									indexes[`${type}_${key}`].push(value);
								}
							} else {
								indexes[`${type}_${key}`] = [value];
							}

							const hashValue = this.redisClient
								.hGet(`att-${type}`, key)
								.then((valueHash: any) => {
									if (valueHash) {
										this.redisClient.hSet(
											`att-${type}`,
											key,
											Number(valueHash) + 1,
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
				// This.logger.info(indexes);
				this.logger.info('add indexes to id: ', tx._id);
				listBulk.push({
					updateOne: {
						filter: {
							_id: tx._id,
						},
						update: {
							indexes,
						},
					},
				});
			});
			this.logger.debug(JSON.stringify(listBulk));
			const result = await this.adapter.bulkWrite(listBulk);
			// Let result = await this.adapter.updateById(tx._id, {
			// 	$set: {
			// 		Indexes: indexes,
			// 	},
			// });
			this.logger.debug('Result: ', JSON.stringify(result));
		}
	}

	public async _start() {
		this.redisClient = await this.getRedisClient();
		this.createJob(
			'index.tx',
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
		this.getQueue('index.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('index.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
