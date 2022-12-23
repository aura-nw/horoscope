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
			Config.REDIS_STREAM_TRANSACTION_NAME,
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this._consumer,
			Config.REDIS_MIN_IDLE_TIME_HANDLE_TRANSACTION,
			'0-0',
			{ COUNT: Config.REDIS_AUTO_CLAIM_COUNT_HANDLE_TRANSACTION },
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
			Config.REDIS_STREAM_TRANSACTION_GROUP,
			this._consumer,
			[{ key: Config.REDIS_STREAM_TRANSACTION_NAME, id: idXReadGroup }],
		);

		if (result) {
			result.forEach(async (element: IRedisStreamResponse) => {
				const listTransactionNeedSaveToDb: ITransaction[] = [];
				const listMessageNeedAck: string[] = [];
				try {
					element.messages.forEach(async (item: IRedisStreamData) => {
						this.logger.info(
							`Handling message ID: ${item.id}, txhash: ${item.message.source}`,
						);
						try {
							const transaction: TransactionEntity =
								new JsonConvert().deserializeObject(
									JSON.parse(item.message.element.toString()),
									TransactionEntity,
								);
							listTransactionNeedSaveToDb.push(transaction);
							listMessageNeedAck.push(item.id.toString());
							this._lastId = item.id.toString();
						} catch (error) {
							this.logger.error('Error when handling message id: ', item.id);
							this.logger.error(JSON.stringify(item));
							if (item.message.source) {
								this.broker.emit('crawl-transaction-hash.retry', {
									txHash: item.message.source,
								} as TransactionHashParam);
								listMessageNeedAck.push(item.id.toString());
							}
							this.logger.error(error);
						}
					});

					this.broker.emit('list-tx.upsert', {
						listTx: listTransactionNeedSaveToDb,
						source: CONST_CHAR.CRAWL,
						chainId: Config.CHAIN_ID,
					} as ListTxCreatedParams);

					await this.handleListTransaction(listTransactionNeedSaveToDb);
					if (listMessageNeedAck.length > 0) {
						this.redisClient.xAck(
							Config.REDIS_STREAM_TRANSACTION_NAME,
							Config.REDIS_STREAM_TRANSACTION_GROUP,
							listMessageNeedAck,
						);
						this.redisClient.xDel(
							Config.REDIS_STREAM_TRANSACTION_NAME,
							listMessageNeedAck,
						);
					}
				} catch (error) {
					this.logger.error(error);
				}
			});
		}
	}

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

							const hashValue = this.redisClient
								.hGet(`att-${type}`, key)
								.then((valueHashmap: any) => {
									if (valueHashmap) {
										this.redisClient.hSet(
											`att-${type}`,
											key,
											Number(valueHashmap) + 1,
										);
									} else {
										this.redisClient.hSet(`att-${type}`, key, 1);
									}
								});
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
		this.redisClient = await this.getRedisClient();
		await this.initEnv();
		this.createJob(
			'handle.transaction',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_TRANSACTION, 10),
				},
			},
		);
		// This.getQueue('handle.transaction').on('completed', (job: Job) => {
		// 	This.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		// });
		// This.getQueue('handle.transaction').on('failed', (job: Job) => {
		// 	This.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		// });
		// This.getQueue('handle.transaction').on('progress', (job: Job) => {
		// 	This.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		// });
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
