/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';

export default class HandleTransactionService extends Service {
	private redisMixin = new RedisMixin().start();
	private dbTransactionMixin = dbTransactionMixin;
	private redisClient;
	private consumer = Date.now().toString();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handletransaction',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.transaction',
					},
				),
				this.redisMixin,
				this.dbTransactionMixin,
			],
			queues: {
				'handle.transaction': {
					concurrency: 1,
					async process(job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.param);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async initEnv() {
		this.logger.info('initEnv');
		try {
			await this.redisClient.xGroupCreate(
				Config.REDIS_STREAM_TRANSACTION_NAME,
				Config.REDIS_STREAM_TRANSACTION_GROUP,
				'0-0',
				{ MKSTREAM: true },
			);
			await this.redisClient.xGroupCreateConsumer(
				Config.REDIS_STREAM_TRANSACTION_NAME,
				Config.REDIS_STREAM_TRANSACTION_GROUP,
				this.consumer,
			);
		} catch (error) {
			this.logger.error(error);
		}
	}
	async handleJob(param) {
		let hasRemainingMessage = true;
		let lastId = '0-0';

		let xAutoClaimResult = await this.redisClient.xAutoClaim(
			Config.REDIS_STREAM_TRANSACTION_NAME,
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this.consumer,
			1000,
			'0-0',
		);
		if (xAutoClaimResult.messages.length == 0) {
			hasRemainingMessage = false;
		}

		let idXReadGroup = '';
		if (hasRemainingMessage) {
			idXReadGroup = lastId;
		} else {
			idXReadGroup = '>';
		}
		const result = await this.redisClient.xReadGroup(
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this.consumer,
			[{ key: Config.REDIS_STREAM_TRANSACTION_NAME, id: idXReadGroup }],
		);
		let listMessageNeedAck: String[] = [];
		if (result)
			result.forEach((element) => {
				element.messages.forEach(async (item) => {
					this.logger.info(`Handling message ${item.id}`);
					await this.handleTransaction(JSON.parse(item.message.element));
					this.redisClient.xAck(
						Config.REDIS_STREAM_TRANSACTION_NAME,
						Config.REDIS_STREAM_TRANSACTION_GROUP,
						item.id,
					);
					listMessageNeedAck.push(item.id);
					lastId = item.id;
				});
			});
	}
	async handleTransaction(transaction) {
		let id = await this.adapter.insert(transaction);
		return id;
	}
	async _start() {
		this.redisClient = await this.getRedisClient();
		this.createJob(
			'handle.transaction',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: 1000,
				},
			},
		);

		await this.initEnv();

		this.getQueue('handle.transaction').on('completed', (job, res) => {
			this.logger.info(`Job #${JSON.stringify(job)} completed!. Result:`, res);
		});
		this.getQueue('handle.transaction').on('failed', (job, err) => {
			this.logger.error(`Job #${JSON.stringify(job)} failed!. Result:`, err);
		});
		this.getQueue('handle.transaction').on('progress', (job, progress) => {
			this.logger.info(`Job #${JSON.stringify(job)} progress is ${progress}%`);
		});
		return super._start();
	}
}
