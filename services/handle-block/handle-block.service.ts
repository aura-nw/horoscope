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
	// Private _consumer = this.broker.nodeID;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-block',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				// New RedisMixin().start(),
				dbBlockMixin,
			],
			queues: {
				'handle.block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// // @ts-ignore
						// Await this.handleJob();
						// @ts-ignore
						await this.handleBlock(job.data.block);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	// Async initEnv() {
	// 	This.logger.info('initEnv');
	// 	Try {
	// 		Await this.redisClient.xGroupCreate(
	// 			Config.REDIS_STREAM_BLOCK_NAME,
	// 			Config.REDIS_STREAM_BLOCK_GROUP,
	// 			'0-0',
	// 			{ MKSTREAM: true },
	// 		);
	// 		Await this.redisClient.xGroupCreateConsumer(
	// 			Config.REDIS_STREAM_BLOCK_NAME,
	// 			Config.REDIS_STREAM_BLOCK_GROUP,
	// 			This._consumer,
	// 		);
	// 	} catch (error) {
	// 		This.logger.error(error);
	// 	}
	// }

	// Private _hasRemainingMessage = true;
	// Private _lastId = '0-0';

	// Async handleJob() {
	// 	Const xAutoClaimResult: IRedisStreamResponse = await this.redisClient.xAutoClaim(
	// 		Config.REDIS_STREAM_BLOCK_NAME,
	// 		Config.REDIS_STREAM_BLOCK_GROUP,
	// 		This._consumer,
	// 		1000,
	// 		'0-0',
	// 		{ COUNT: Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_BLOCK },
	// 	);
	// 	If (xAutoClaimResult.messages.length === 0) {
	// 		This._hasRemainingMessage = false;
	// 	}

	// 	Let idXReadGroup = '';
	// 	If (this._hasRemainingMessage) {
	// 		IdXReadGroup = this._lastId;
	// 	} else {
	// 		IdXReadGroup = '>';
	// 	}
	// 	Const result: IRedisStreamResponse[] = await this.redisClient.xReadGroup(
	// 		Config.REDIS_STREAM_BLOCK_GROUP,
	// 		This._consumer,
	// 		[{ key: Config.REDIS_STREAM_BLOCK_NAME, id: idXReadGroup }],
	// 	);
	// 	If (result) {
	// 		Result.forEach(async (element: IRedisStreamResponse) => {
	// 			Const listBlockNeedSaveToDb: IBlock[] = [];
	// 			Const listMessageNeedAck: string[] = [];
	// 			Const listTx: string[] = [];
	// 			Try {
	// 				Element.messages.forEach((item: IRedisStreamData) => {
	// 					Const block: BlockEntity = new JsonConvert().deserializeObject(
	// 						JSON.parse(item.message.element.toString()),
	// 						BlockEntity,
	// 					);
	// 					This.logger.info(
	// 						`Handling message: ${item.id}, block height: ${block.block?.header?.height}`,
	// 					);
	// 					ListBlockNeedSaveToDb.push(block);
	// 					Const listTxInBlock = block.block?.data?.txs;
	// 					If (listTxInBlock) {
	// 						ListTx.push(...listTxInBlock.map((tx) => tx.toString()));
	// 					}

	// 					ListMessageNeedAck.push(item.id.toString());
	// 					This._lastId = item.id.toString();
	// 				});

	// 				If (listBlockNeedSaveToDb.length > 0) {
	// 					This.handleListBlock(listBlockNeedSaveToDb);
	// 				}
	// 				If (listTx.length > 0) {
	// 					// This.broker.emit('list-transaction.created', {
	// 					// 	ListTx: listTx,
	// 					// } as ListTxInBlockParams);
	// 					This.createJob(
	// 						'crawl.transaction',
	// 						{
	// 							ListTx,
	// 						},
	// 						{
	// 							RemoveOnComplete: true,
	// 							RemoveOnFail: {
	// 								Count: 10,
	// 							},
	// 						},
	// 					);
	// 				}
	// 				If (listMessageNeedAck.length > 0) {
	// 					This.redisClient.xAck(
	// 						Config.REDIS_STREAM_BLOCK_NAME,
	// 						Config.REDIS_STREAM_BLOCK_GROUP,
	// 						ListMessageNeedAck,
	// 					);
	// 					This.redisClient.xDel(Config.REDIS_STREAM_BLOCK_NAME, listMessageNeedAck);
	// 				}
	// 			} catch (error) {
	// 				This.logger.error(error);
	// 			}
	// 		});
	// 	}
	// }

	async handleBlock(block: IBlock) {
		const jsonConvert: JsonConvert = new JsonConvert();
		// JsonConvert.operationMode = OperationMode.LOGGING;
		const blockEntity: BlockEntity = jsonConvert.deserializeObject(block, BlockEntity);
		const listFoundBlock: BlockEntity[] = await this.adapter.find({
			query: {
				'block_id.hash': blockEntity.block_id?.hash,
			},
		});

		const listTx = blockEntity.block?.data?.txs;
		if (listTx && listTx.length > 0) {
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
		this.logger.info(`Found ${listFoundBlock.length} blocks in db`);
		if (listFoundBlock.length === 0) {
			const listId = await this.adapter.insert(blockEntity);
			this.broker.emit('list-block.upserted', {
				listBlock: [block],
				chainId: Config.CHAIN_ID,
			} as ListBlockCreatedParams);
			return listId;
		}
		return null;
	}

	// Async handleListBlock(listBlock: IBlock[]) {
	// 	Const jsonConvert: JsonConvert = new JsonConvert();
	// 	// JsonConvert.operationMode = OperationMode.LOGGING;
	// 	Const listBlockEntity: BlockEntity[] = jsonConvert.deserializeArray(listBlock, BlockEntity);
	// 	Const listBlockNeedSaveToDb: BlockEntity[] = [];
	// 	Const listHash = listBlockEntity.map((item: BlockEntity) => {
	// 		If (item && item.block_id && item.block_id.hash) {
	// 			Return item.block_id.hash;
	// 		}
	// 		Return null;
	// 	});
	// 	Const listFoundBlock: BlockEntity[] = await this.adapter.find({
	// 		Query: {
	// 			'block_id.hash': {
	// 				$in: listHash,
	// 			},
	// 		},
	// 	});
	// 	This.logger.info(`Found ${listFoundBlock.length} blocks in db`);
	// 	ListBlockEntity.forEach((block: BlockEntity) => {
	// 		Try {
	// 			Const hash = block?.block_id?.hash;
	// 			This.logger.info('handle block height: ', block.block?.header?.height);
	// 			Const foundItem = listFoundBlock.find(
	// 				(item: BlockEntity) => item?.block_id?.hash === hash,
	// 			);
	// 			If (!foundItem) {
	// 				ListBlockNeedSaveToDb.push(block);
	// 			}
	// 		} catch (error) {
	// 			This.logger.error(error);
	// 		}
	// 	});
	// 	If (listBlockNeedSaveToDb.length > 0) {
	// 		Const listId = await this.adapter.insertMany(listBlockNeedSaveToDb);
	// 		This.broker.emit('list-block.upserted', {
	// 			ListBlock: listBlockNeedSaveToDb,
	// 			ChainId: Config.CHAIN_ID,
	// 		} as ListBlockCreatedParams);
	// 		Return listId;
	// 	}
	// }

	public async _start() {
		// This.redisClient = await this.getRedisClient();

		// Await this.initEnv();

		// This.createJob(
		// 	'handle.block',
		// 	{
		// 		Param: 'param',
		// 	},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 		Repeat: {
		// 			Every: parseInt(Config.MILISECOND_HANDLE_BLOCK, 10),
		// 		},
		// 	},
		// );

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
