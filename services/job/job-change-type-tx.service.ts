/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { IAttribute, IEvent, ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { ObjectID, ObjectId } from 'bson';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
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
		// let listTx = await this.adapter.find({
		// 	query: {
		// 		_id: {
		// 			$gt: new ObjectID('630b9f100000000000000000'),
		// 			// $lt: new ObjectID('630bf202acc31a0012577ffd'),
		// 		},
		// 	},
		// 	limit: 5000,
		// 	//@ts-ignore
		// 	sort: '-_id',
		// });
		let listTx = await this.adapter.find({
			query: { 'indexes.message_action': { $regex: /[_]/g } },
			limit: 5000,
		});
		this.logger.info(1);
		let bulkOps: any[] = [];
		listTx.forEach(async (tx: any) => {
			this.logger.info(tx._id.toString());
			const actions = tx.indexes.message_action;
			let newActions = actions.map((action: string) => {
				return action.replace(/\_/g, '.');
			});

			bulkOps.push({
				updateOne: {
					filter: { _id: tx._id },
					update: { $set: { 'indexes.message_action': newActions } },
				},
			});
			if (bulkOps.length === 500) {
				let result = await this.adapter.bulkWrite(bulkOps);
				this.logger.info(result);
				this.logger.info('done 500');
				bulkOps = [];
			}
		});
		if (bulkOps.length > 0) {
			let result = await this.adapter.bulkWrite(bulkOps);
			this.logger.info(result);
		}
		this.logger.info('done');
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
