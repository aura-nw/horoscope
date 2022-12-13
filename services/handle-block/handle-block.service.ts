/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { BlockEntity, IBlock } from '../../entities';
import { IRedisStreamData, IRedisStreamResponse, ListBlockCreatedParams } from '../../types';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleBlockService extends Service {
	private _consumer = this.broker.nodeID;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleblock',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new RedisMixin().start(),
				dbBlockMixin,
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
				this._consumer,
			);
		} catch (error) {
			this.logger.error(error);
		}
	}

	private _hasRemainingMessage = true;
	private _lastId = '0-0';

	async handleJob() {
		const xAutoClaimResult: IRedisStreamResponse = await this.redisClient.xAutoClaim(
			Config.REDIS_STREAM_BLOCK_NAME,
			Config.REDIS_STREAM_BLOCK_GROUP,
			this._consumer,
			1000,
			'0-0',
			{ COUNT: Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_BLOCK },
		);
		if (xAutoClaimResult.messages.length === 0) {
			this._hasRemainingMessage = false;
		}

		let idXReadGroup = '';
		if (this._hasRemainingMessage) {
			idXReadGroup = this._lastId;
		} else {
			idXReadGroup = '>';
		}
		const result: IRedisStreamResponse[] = await this.redisClient.xReadGroup(
			Config.REDIS_STREAM_BLOCK_GROUP,
			this._consumer,
			[{ key: Config.REDIS_STREAM_BLOCK_NAME, id: idXReadGroup }],
		);
		if (result) {
			result.forEach(async (element: IRedisStreamResponse) => {
				const listBlockNeedSaveToDb: IBlock[] = [];
				const listMessageNeedAck: string[] = [];
				const listTx: string[] = [];
				try {
					element.messages.forEach((item: IRedisStreamData) => {
						const block: BlockEntity = new JsonConvert().deserializeObject(
							JSON.parse(item.message.element.toString()),
							BlockEntity,
						);
						this.logger.info(
							`Handling message: ${item.id}, block height: ${block.block?.header?.height}`,
						);
						listBlockNeedSaveToDb.push(block);
						const listTxInBlock = block.block?.data?.txs;
						if (listTxInBlock) {
							listTx.push(...listTxInBlock.map((tx) => tx.toString()));
						}

						listMessageNeedAck.push(item.id.toString());
						this._lastId = item.id.toString();
					});

					if (listBlockNeedSaveToDb.length > 0) {
						this.handleListBlock(listBlockNeedSaveToDb);
					}
					if (listTx.length > 0) {
						// This.broker.emit('list-transaction.created', {
						// 	ListTx: listTx,
						// } as ListTxInBlockParams);
						this.createJob(
							'crawl.transaction',
							{
								listTx,
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
	}

	async handleListBlock(listBlock: IBlock[]) {
		const jsonConvert: JsonConvert = new JsonConvert();
		// JsonConvert.operationMode = OperationMode.LOGGING;
		const listBlockEntity: BlockEntity[] = jsonConvert.deserializeArray(listBlock, BlockEntity);
		const listBlockNeedSaveToDb: BlockEntity[] = [];
		const listHash = listBlockEntity.map((item: BlockEntity) => {
			if (item && item.block_id && item.block_id.hash) {
				return item.block_id.hash;
			}
			return null;
		});
		const listFoundBlock: BlockEntity[] = await this.adapter.find({
			query: {
				'block_id.hash': {
					$in: listHash,
				},
			},
		});
		this.logger.info(`Found ${listFoundBlock.length} blocks in db`);
		listBlockEntity.forEach((block: BlockEntity) => {
			try {
				const hash = block?.block_id?.hash;
				this.logger.info('handle block height: ', block.block?.header?.height);
				const foundItem = listFoundBlock.find(
					(item: BlockEntity) => item?.block_id?.hash === hash,
				);
				if (!foundItem) {
					listBlockNeedSaveToDb.push(block);
				}
			} catch (error) {
				this.logger.error(error);
			}
		});
		if (listBlockNeedSaveToDb.length > 0) {
			const listId = await this.adapter.insertMany(listBlockNeedSaveToDb);
			this.broker.emit('list-block.upserted', {
				listBlock: listBlockNeedSaveToDb,
				chainId: Config.CHAIN_ID,
			} as ListBlockCreatedParams);
			return listId;
		}
	}

	public async _start() {
		this.redisClient = await this.getRedisClient();

		await this.initEnv();

		this.createJob(
			'handle.block',
			{
				param: 'param',
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
