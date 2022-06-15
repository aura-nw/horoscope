/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { BlockEntity } from '../../entities';
export default class HandleBlockService extends Service {
	private redisMixin = new RedisMixin().start();
	private dbBlockMixin = dbBlockMixin;
	private redisClient;
	private consumer = Date.now().toString();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleblock',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.block',
					},
				),
				this.redisMixin,
				this.dbBlockMixin,
			],
			queues: {
				'handle.block': {
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
				Config.REDIS_STREAM_BLOCK_NAME,
				Config.REDIS_STREAM_BLOCK_GROUP,
				'0-0',
				{ MKSTREAM: true },
			);
			await this.redisClient.xGroupCreateConsumer(
				Config.REDIS_STREAM_BLOCK_NAME,
				Config.REDIS_STREAM_BLOCK_GROUP,
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
			Config.REDIS_STREAM_BLOCK_NAME,
			Config.REDIS_STREAM_BLOCK_GROUP,
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
			Config.REDIS_STREAM_BLOCK_GROUP,
			this.consumer,
			[{ key: Config.REDIS_STREAM_BLOCK_NAME, id: idXReadGroup }],
		);

		if (result)
			result.forEach(async (element) => {
				let listBlockNeedSaveToDb: any[] = [];
				let listMessageNeedAck: any[] = [];
				let listTx: any[] = [];
				element.messages.forEach(async (item) => {
					this.logger.info(`Handling message ${item.id}`);
					let block = JSON.parse(item.message.element);
					if (block.block.header.height == '2062') {
						this.logger.info(2);
					}
					listBlockNeedSaveToDb.push(block);
					listTx.push(...block.block.data.txs);
					listMessageNeedAck.push(item.id);
					lastId = item.id;
				});
				if (listBlockNeedSaveToDb.length > 0) {
					await this.handleListBlock(listBlockNeedSaveToDb);
				}
				if (listTx.length > 0) {
					await this.broker.call('v1.crawltransaction.crawlListTransaction', {
						listTx: listTx,
					});
				}
				if (listMessageNeedAck.length > 0) {
					await this.redisClient.xAck(
						Config.REDIS_STREAM_BLOCK_NAME,
						Config.REDIS_STREAM_BLOCK_GROUP,
						listMessageNeedAck,
					);
				}
			});
	}

	async handleListBlock(listBlock) {
		let jsonConvert: JsonConvert = new JsonConvert();
		// jsonConvert.operationMode = OperationMode.LOGGING;
		const item: any = jsonConvert.deserializeArray(listBlock, BlockEntity);
		let listId = await this.adapter.insertMany(item);
		return listId;
	}

	async _start() {
		this.redisClient = await this.getRedisClient();

		await this.initEnv();

		this.createJob(
			'handle.block',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_BLOCK, 10),
				},
			},
		);

		this.getQueue('handle.block').on('completed', (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});
		this.getQueue('handle.block').on('failed', (job, err) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, err);
		});
		this.getQueue('handle.block').on('progress', (job, progress) => {
			this.logger.info(`Job #${job.id} progress is ${progress}%`);
		});
		return super._start();
	}
}
