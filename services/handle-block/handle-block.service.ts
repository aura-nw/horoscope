/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require ('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { BlockEntity } from '../../entities';
import { Job } from 'bull';
export default class HandleBlockService extends Service {
	private redisMixin = new RedisMixin().start();
	private dbBlockMixin = dbBlockMixin;
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
					async process(job : Job) {
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

	private hasRemainingMessage = true;
	private lastId = '0-0';

	async handleJob() {
		this.logger.info("handleJob");
		

		let xAutoClaimResult = await this.redisClient.xAutoClaim(
			Config.REDIS_STREAM_BLOCK_NAME,
			Config.REDIS_STREAM_BLOCK_GROUP,
			this.consumer,
			1000,
			'0-0',
			'COUNT',
			'100'
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
		const result = await this.redisClient.xReadGroup(
			Config.REDIS_STREAM_BLOCK_GROUP,
			this.consumer,
			[{ key: Config.REDIS_STREAM_BLOCK_NAME, id: idXReadGroup }],
		);
		try {
			if (result)
			await result.forEach(async (element: any) => {
				let listBlockNeedSaveToDb: any[] = [];
				let listMessageNeedAck: any[] = [];
				let listTx: any[] = [];
				element.messages.forEach(async (item: any) => {
					this.logger.info(`Handling message ${item.id}`);
					let block = JSON.parse(item.message.element);
					if (block.block.header.height == '2062') {
						this.logger.info(2);
					}
					listBlockNeedSaveToDb.push(block);
					listTx.push(...block.block.data.txs);
					listMessageNeedAck.push(item.id);
					this.lastId = item.id;
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
		} catch (error) {
			this.logger.error(error);
		}
		
		this.logger.info(`handleJob done`);
	}

	async handleListBlock(listBlock: any) {
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

		this.getQueue('handle.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.block').on('failed', (job: Job ) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('handle.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
