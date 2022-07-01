/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { JsonConvert, OperationMode } from 'json2typescript';
import { ITransaction, TransactionEntity } from '../../entities';
import { CONST_CHAR } from '../../common/constant';
import { IRedisStreamData, IRedisStreamResponse, ListTxCreatedParams } from '../../types';

export default class HandleTransactionService extends Service {
	private redisMixin = new RedisMixin().start();
	private dbTransactionMixin = dbTransactionMixin;
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
					async process(job: Job) {
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
		this.redisClient = await this.getRedisClient();
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
	private hasRemainingMessage = true;
	private lastId = '0-0';
	async handleJob() {
		let xAutoClaimResult: IRedisStreamResponse = await this.redisClient.xAutoClaim(
			Config.REDIS_STREAM_TRANSACTION_NAME,
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this.consumer,
			1000,
			'0-0',
			'COUNT',
			Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_TRANSACTION,
		);
		if (xAutoClaimResult.messages.length == 0) {
			this.hasRemainingMessage = false;
		}

		let idXReadGroup = '';
		if (this.hasRemainingMessage) {
			idXReadGroup = this.lastId;
		} else {
			idXReadGroup = '>';
		}
		const result: IRedisStreamResponse[] = await this.redisClient.xReadGroup(
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this.consumer,
			[{ key: Config.REDIS_STREAM_TRANSACTION_NAME, id: idXReadGroup }],
		);

		if (result)
			result.forEach(async (element: IRedisStreamResponse) => {
				let listTransactionNeedSaveToDb: ITransaction[] = [];
				let listMessageNeedAck: String[] = [];
				try {
					element.messages.forEach(async (item: IRedisStreamData) => {
						this.logger.info(`Handling message ${item.id}`);
						const transaction: TransactionEntity = new JsonConvert().deserializeObject(
							JSON.parse(item.message.element.toString()),
							TransactionEntity,
						);
						listTransactionNeedSaveToDb.push(transaction);
						listMessageNeedAck.push(item.id);
						this.lastId = item.id.toString();
					});

					await this.handleListTransaction(listTransactionNeedSaveToDb);
					this.redisClient.xAck(
						Config.REDIS_STREAM_TRANSACTION_NAME,
						Config.REDIS_STREAM_TRANSACTION_GROUP,
						listMessageNeedAck,
					);
					this.redisClient.xDel(Config.REDIS_STREAM_TRANSACTION_NAME, listMessageNeedAck);
					this.broker.emit('account-info.handle-address', {
						listTx: listTransactionNeedSaveToDb,
						source: CONST_CHAR.CRAWL,
						chainId: Config.CHAIN_ID,
					} as ListTxCreatedParams);
				} catch (error) {
					this.logger.error(error);
				}
			});
	}

	async handleListTransaction(listTransaction: ITransaction[]) {
		let jsonConvert = new JsonConvert();
		try {
			// jsonConvert.operationMode = OperationMode.LOGGING;
			const item: any = jsonConvert.deserializeArray(listTransaction, TransactionEntity);
			let listId = await this.adapter.insertMany(item);
			return listId;
		} catch (error) {
			throw error;
		}
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
					every: parseInt(Config.MILISECOND_HANDLE_TRANSACTION, 10),
				},
			},
		);

		await this.initEnv();

		this.getQueue('handle.transaction').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.transaction').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('handle.transaction').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
