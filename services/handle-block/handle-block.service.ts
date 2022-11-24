/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { BlockEntity, IBlock } from '../../entities';
import { Job } from 'bull';
import { IRedisStreamData, IRedisStreamResponse, ListBlockCreatedParams } from '../../types';
import { ListTxInBlockParams } from '../../types';
import { CONST_CHAR } from 'common/constant';
import { QueueConfig } from '../../config/queue';

export default class HandleBlockService extends Service {
	private redisMixin = new RedisMixin().start();
	private dbBlockMixin = dbBlockMixin;
	private consumer = this.broker.nodeID;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleblock',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.redisMixin,
				this.dbBlockMixin,
			],
			queues: {
				'handle.block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob();
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
		let xAutoClaimResult: IRedisStreamResponse = await this.redisClient.xAutoClaim(
			Config.REDIS_STREAM_BLOCK_NAME,
			Config.REDIS_STREAM_BLOCK_GROUP,
			this.consumer,
			1000,
			'0-0',
			{ COUNT: Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_BLOCK },
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
			Config.REDIS_STREAM_BLOCK_GROUP,
			this.consumer,
			[{ key: Config.REDIS_STREAM_BLOCK_NAME, id: idXReadGroup }],
		);
		if (result)
			result.forEach(async (element: IRedisStreamResponse) => {
				let listBlockNeedSaveToDb: IBlock[] = [];
				let listMessageNeedAck: String[] = [];
				let listTx: String[] = [];
				try {
					element.messages.forEach((item: IRedisStreamData) => {
						let itemBlock = JSON.parse(item.message.element.toString());
						itemBlock.block_id = itemBlock.block_meta.block_id;
						itemBlock.block.last_commit.height = Math.max(
							Number(itemBlock.block.header.height) - 1,
							0,
						);
						const block: BlockEntity = new JsonConvert().deserializeObject(
							itemBlock,
							BlockEntity,
						);
						this.logger.info(
							`Handling message: ${item.id}, block height: ${block.block?.header?.height}`,
						);
						listBlockNeedSaveToDb.push(block);
						let listTxInBlock = block.block?.data?.txs;
						if (listTxInBlock) {
							listTx.push(...listTxInBlock);
						}

						listMessageNeedAck.push(item.id);
						this.lastId = item.id.toString();
					});

					if (listBlockNeedSaveToDb.length > 0) {
						this.handleListBlock(listBlockNeedSaveToDb);
					}
					if (listTx.length > 0) {
						// this.broker.emit('list-transaction.created', {
						// 	listTx: listTx,
						// } as ListTxInBlockParams);
						this.createJob(
							'crawl.transaction',
							{
								listTx: listTx,
							},
							{
								removeOnComplete: true,
								removeOnFail: {
									count: 10,
								},
							},
						);
					}
					if (listMessageNeedAck.length > 0) {
						this.redisClient.xAck(
							Config.REDIS_STREAM_BLOCK_NAME,
							Config.REDIS_STREAM_BLOCK_GROUP,
							listMessageNeedAck,
						);
						this.redisClient.xDel(Config.REDIS_STREAM_BLOCK_NAME, listMessageNeedAck);
					}
				} catch (error) {
					this.logger.error(error);
				}
			});
	}

	async handleListBlock(listBlock: any[]) {
		let jsonConvert: JsonConvert = new JsonConvert();
		// jsonConvert.operationMode = OperationMode.LOGGING;
		listBlock.map((block: any) => {});
		const listBlockEntity: BlockEntity[] = jsonConvert.deserializeArray(listBlock, BlockEntity);
		let listBlockNeedSaveToDb: BlockEntity[] = [];
		let listHash = listBlockEntity.map((item: BlockEntity) => {
			if (item && item.block_id && item.block_id.hash) return item.block_id.hash;
			return null;
		});
		let listFoundBlock: BlockEntity[] = await this.adapter.find({
			query: {
				'block_id.hash': {
					$in: listHash,
				},
			},
		});
		this.logger.info(`Found ${listFoundBlock.length} blocks in db`);
		listBlockEntity.forEach((block: BlockEntity) => {
			try {
				let hash = block?.block_id?.hash;
				this.logger.info('handle block height: ', block.block?.header?.height);
				let foundItem = listFoundBlock.find((item: BlockEntity) => {
					return item?.block_id?.hash === hash;
				});
				if (!foundItem) {
					listBlockNeedSaveToDb.push(block);
				}
			} catch (error) {
				this.logger.error(error);
			}
		});
		if (listBlockNeedSaveToDb.length > 0) {
			let listId = await this.adapter.insertMany(listBlockNeedSaveToDb);
			this.broker.emit('list-block.upserted', {
				listBlock: listBlockNeedSaveToDb,
				chainId: Config.CHAIN_ID,
			} as ListBlockCreatedParams);
			return listId;
		}
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
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_BLOCK, 10),
				},
			},
		);

		this.getQueue('handle.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('handle.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
