/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { IAttribute, IEvent, ITransaction, TransactionEntity } from '../../entities';
import { CONST_CHAR, MSG_TYPE } from '../../common/constant';
import {
	IRedisStreamData,
	IRedisStreamResponse,
	ListTxCreatedParams,
	TransactionHashParam,
} from '../../types';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
import { Utils } from '../../utils/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleTransactionService extends Service {
	private _consumer = this.broker.nodeID;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-transaction',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbTransactionMixin,
				new RedisMixin().start(),
			],
			queues: {
				'handle.transaction': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						// Await this.handleJob();
						await this.handleTransaction(job.data.tx);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}
	async handleTransaction(tx: ITransaction) {
		const transaction: TransactionEntity = new JsonConvert().deserializeObject(
			tx,
			TransactionEntity,
		);
		await this.handleListTransaction([transaction]);
	}
	// Async initEnv() {
	// 	This.logger.info('initEnv');
	// 	This.redisClient = await this.getRedisClient();
	// 	Try {
	// 		Await this.redisClient.xGroupCreate(
	// 			Config.REDIS_STREAM_TRANSACTION_NAME,
	// 			Config.REDIS_STREAM_TRANSACTION_GROUP,
	// 			'0-0',
	// 			{ MKSTREAM: true },
	// 		);
	// 		Await this.redisClient.xGroupCreateConsumer(
	// 			Config.REDIS_STREAM_TRANSACTION_NAME,
	// 			Config.REDIS_STREAM_TRANSACTION_GROUP,
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
	// 		Config.REDIS_STREAM_TRANSACTION_NAME,
	// 		Config.REDIS_STREAM_TRANSACTION_GROUP,
	// 		This._consumer,
	// 		Config.REDIS_MIN_IDLE_TIME_HANDLE_TRANSACTION,
	// 		'0-0',
	// 		{ COUNT: Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_TRANSACTION },
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
	// 		Config.REDIS_STREAM_TRANSACTION_GROUP,
	// 		This._consumer,
	// 		[{ key: Config.REDIS_STREAM_TRANSACTION_NAME, id: idXReadGroup }],
	// 	);

	// 	If (result) {
	// 		Result.forEach(async (element: IRedisStreamResponse) => {
	// 			Const listTransactionNeedSaveToDb: ITransaction[] = [];
	// 			Const listMessageNeedAck: string[] = [];
	// 			Try {
	// 				Element.messages.forEach(async (item: IRedisStreamData) => {
	// 					This.logger.info(
	// 						`Handling message ID: ${item.id}, txhash: ${item.message.source}`,
	// 					);
	// 					Try {
	// 						Const transaction: TransactionEntity =
	// 							New JsonConvert().deserializeObject(
	// 								JSON.parse(item.message.element.toString()),
	// 								TransactionEntity,
	// 							);
	// 						ListTransactionNeedSaveToDb.push(transaction);
	// 						ListMessageNeedAck.push(item.id.toString());
	// 						This._lastId = item.id.toString();
	// 					} catch (error) {
	// 						This.logger.error('Error when handling message id: ', item.id);
	// 						This.logger.error(JSON.stringify(item));
	// 						If (item.message.source) {
	// 							This.broker.emit('crawl-transaction-hash.retry', {
	// 								TxHash: item.message.source,
	// 							} as TransactionHashParam);
	// 							ListMessageNeedAck.push(item.id.toString());
	// 						}
	// 						This.logger.error(error);
	// 					}
	// 				});

	// 				This.broker.emit('list-tx.upsert', {
	// 					ListTx: listTransactionNeedSaveToDb,
	// 					Source: CONST_CHAR.CRAWL,
	// 					ChainId: Config.CHAIN_ID,
	// 				} as ListTxCreatedParams);

	// 				Await this.handleListTransaction(listTransactionNeedSaveToDb);
	// 				If (listMessageNeedAck.length > 0) {
	// 					This.redisClient.xAck(
	// 						Config.REDIS_STREAM_TRANSACTION_NAME,
	// 						Config.REDIS_STREAM_TRANSACTION_GROUP,
	// 						ListMessageNeedAck,
	// 					);
	// 					This.redisClient.xDel(
	// 						Config.REDIS_STREAM_TRANSACTION_NAME,
	// 						ListMessageNeedAck,
	// 					);
	// 				}
	// 			} catch (error) {
	// 				This.logger.error(error);
	// 			}
	// 		});
	// 	}
	// }

	async handleListTransaction(listTransaction: ITransaction[]) {
		const jsonConvert = new JsonConvert();
		try {
			// JsonConvert.operationMode = OperationMode.LOGGING;
			const listTransactionEntity: any = jsonConvert.deserializeArray(
				listTransaction,
				TransactionEntity,
			);
			const listHash = listTransaction.map((item: ITransaction) => item.tx_response.txhash);
			const listFoundTransaction: ITransaction[] = await this.adapter.find({
				query: {
					'tx_response.txhash': {
						$in: listHash,
					},
				},
			});
			const listTransactionNeedSaveToDb: ITransaction[] = [];

			// Add indexes to transaction
			listTransactionEntity.forEach((tx: ITransaction) => {
				const indexes: any = {};

				// Add index in case smart contract
				const listMsg = tx.tx.body.messages;
				try {
					listMsg.map((msg: any) => {
						if (msg['@type'] && msg['@type'] === MSG_TYPE.MSG_EXECUTE_CONTRACT) {
							this._addToIndexes(indexes, 'message', 'action', msg['@type']);
							if (msg.sender && msg.sender.length <= 100) {
								// Found attribute in index, if yes then add new
								this._addToIndexes(indexes, 'wasm', 'sender', msg.sender);
							}
							if (msg.contract && msg.contract.length <= 200) {
								this._addToIndexes(
									indexes,
									'wasm',
									'_contract_address',
									msg.contract,
								);
								this._addToIndexes(
									indexes,
									'execute',
									'_contract_address',
									msg.contract,
								);
							}
							if (msg.msg) {
								const msgInput = msg.msg;
								// eslint-disable-next-line @typescript-eslint/no-this-alias
								const self = this;
								Object.keys(msgInput).map((key) => {
									self._addToIndexes(indexes, 'wasm', 'action', key);
									['recipient', 'owner', 'token_id'].map((att: string) => {
										if (
											msgInput[key][att] &&
											msgInput[key][att].length <= 200
										) {
											self._addToIndexes(
												indexes,
												'wasm',
												att,
												msgInput[key][att],
											);
											const isValidAddress = Utils.isValidAddress(
												msgInput[key][att],
											);
											if (isValidAddress) {
												self._addToIndexes(
													indexes,
													'addresses',
													'',
													msgInput[key][att],
												);
											}
										}
									});
								});
							}
						}
					});
				} catch (error) {
					this.logger.error('This message execute contract is error');
					this.logger.error(error);
				}

				// @ts-ignore
				indexes.timestamp = new Date(tx.tx_response.timestamp);
				indexes.height = Number(tx.tx_response.height);

				tx.tx_response.events.map((event: IEvent) => {
					let type = event.type.toString();
					type = type.replace(/\./g, '_');
					const attributes = event.attributes;
					attributes.map((attribute: IAttribute) => {
						try {
							let key = fromUtf8(fromBase64(attribute.key.toString()));
							const value = attribute.value
								? fromUtf8(fromBase64(attribute.value.toString()))
								: '';
							key = key.replace(/\./g, '_');
							this._addToIndexes(indexes, type, key, value);

							// Add to listAddress if value is valid address
							const isValidAddress = Utils.isValidAddress(value);
							if (isValidAddress) {
								// ListAddress.push(value);
								this._addToIndexes(indexes, 'addresses', '', value);
							}
						} catch (error) {
							this.logger.info(tx._id);
							this.logger.error(error);
						}
					});
				});

				tx.indexes = indexes;

				const hash = tx.tx_response.txhash;
				const foundItem = listFoundTransaction.find(
					(itemFound: ITransaction) => itemFound.tx_response.txhash === hash,
				);

				if (!foundItem) {
					listTransactionNeedSaveToDb.push(tx);
				}
			});
			const listId = await this.adapter.insertMany(listTransactionNeedSaveToDb);
			return listId;
		} catch (error) {
			throw error;
		}
	}

	private _addToIndexes(indexes: any, type: string, key: string, value: string) {
		let index = `${type}`;
		if (key) {
			index = `${type}_${key}`;
		}
		const array = indexes[index];
		if (array && array.length > 0) {
			const position = indexes[index].indexOf(value);
			if (position === -1) {
				indexes[index].push(value);
			}
		} else {
			indexes[index] = [value];
		}
	}

	public async _start() {
		await this.broker.waitForServices(['v1.handle-transaction-upserted']);
		// This.redisClient = await this.getRedisClient();
		// Await this.initEnv();
		// This.createJob(
		// 	'handle.transaction',
		// 	{},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 		Repeat: {
		// 			Every: parseInt(Config.MILISECOND_HANDLE_TRANSACTION, 10),
		// 		},
		// 	},
		// );
		this.getQueue('handle.transaction').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.transaction').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('handle.transaction').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
