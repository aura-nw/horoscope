/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Context, ServiceBroker } from 'moleculer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { Config } from '../../common';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
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
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.lastId);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(lastId: string) {
		const listTx = await this.adapter.find({
			query: {
				'custom_info.chain_id': 'euphoria-1',
				'indexes.height': { $type: 'string' },
			},
			limit: 500,
			sort: '-indexes.height',
		});
		// Let listTx = await this.adapter.find({
		// 	Query: { 'indexes.message_action': { $regex: /[_]/g } },
		// 	Limit: 5000,
		// });
		this.logger.info(1);
		let bulkOps: any[] = [];
		listTx.forEach(async (tx: any) => {
			this.logger.info(tx._id.toString());
			const indexes: any = {};
			indexes.timestamp = tx.tx_response.timestamp;
			indexes.height = tx.tx_response.height;
			// Const actions = tx.indexes.message_action;
			// Let newActions = actions.map((action: string) => {
			// 	Return action.replace(/\_/g, '.');
			// });

			bulkOps.push({
				updateOne: {
					filter: { _id: tx._id },
					update: {
						$set: {
							'indexes.timestamp': indexes.timestamp,
							'indexes.height': indexes.height,
						},
					},
				},
			});
			if (bulkOps.length === 500) {
				const result = await this.adapter.bulkWrite(bulkOps);
				this.logger.info(result);
				this.logger.info('done 500');
				bulkOps = [];
			}
		});
		if (bulkOps.length > 0) {
			const result = await this.adapter.bulkWrite(bulkOps);
			this.logger.info(result);
		}
		this.logger.info('done');
	}

	public async _start() {
		// Let operatorAddress = 'cosmosvaloper1c4k24jzduc365kywrsvf5ujz4ya6mwympnc4en';
		// Const operator_address = data.operator_address;
		// Const decodeAcc = bech32.decode(operatorAddress);
		// Const wordsByte = bech32.fromWords(decodeAcc.words);
		// Const account_address = bech32.encode('cosmos', bech32.toWords(wordsByte));

		// Const operator_address = operatorAddress;
		// Const decodeAcc = bech32.decode(operator_address.toString());
		// Const wordsByte = bech32.fromWords(decodeAcc.words);
		// Const account_address = bech32.encode('cosmos', bech32.toWords(wordsByte));
		// This.logger.info('account_address:', account_address);
		// This.redisClient = await this.getRedisClient();
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
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
