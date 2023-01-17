/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { JsonConvert } from 'json2typescript';
import { fromBase64, fromUtf8, toBase64 } from '@cosmjs/encoding';
import {} from '@cosmjs/cosmwasm-stargate';
import { decodeTxRaw } from '@cosmjs/proto-signing';
import { Secp256k1HdWallet } from '@cosmjs/amino';
import _ from 'lodash';
import RedisMixin from '../../../mixins/redis/redis.mixin';
import { dbTransactionMixin } from '../../../mixins/dbMixinMongoose';
import { IAttribute, IEvent, ITransaction, TransactionEntity } from '../../../entities';
import { CONST_CHAR, MSG_TYPE } from '../../../common/constant';
import { ListTxCreatedParams } from '../../../types';
import { queueConfig } from '../../../config/queue';
import { Utils } from '../../../utils/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleTransactionService extends Service {
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
						await this.handleJob(job.data.listTx, job.data.chainId, job.data.timestamp);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}
	async handleJob(listTx: any, chainId: string, timestamp: string) {
		try {
			const wallet = await Secp256k1HdWallet.fromMnemonic(
				'mixed adjust adult chimney mesh room develop smoke crazy artwork paper minimum',
			);
			const signing = await SigningCosmWasmClient.offline(wallet);

			listTx.txs.map((tx: any) => {
				// decode tx to readable

				const decodedTx = decodeTxRaw(fromBase64(tx.tx));

				tx.tx = decodedTx;
				tx.tx.signatures = decodedTx.signatures.map((signature: Uint8Array) =>
					toBase64(signature),
				);

				// signing.registry.register(
				// 	'/cosmos.feegrant.v1beta1.MsgGrantAllowance',
				// 	// @ts-ignore
				// 	cosmos.feegrant.v1beta1.MsgGrantAllowance,
				// );
				const decodedMsgs = decodedTx.body.messages.map((msg) => {
					let decodedMsg = signing.registry.decode(msg);

					Object.keys(decodedMsg).map((key) => {
						try {
							// check if msg is uint8array
							if (decodedMsg[key] instanceof Uint8Array) {
								decodedMsg[key] = JSON.parse(fromUtf8(decodedMsg[key]));
							}
						} catch (error) {
							// error if key is not json
							this.logger.warn('decode tx fail');
						}
					});
					decodedMsg = this._camelizeKeys(decodedMsg);
					decodedMsg['@type'] = msg.typeUrl;
					return decodedMsg;
				});
				tx.tx = {
					body: {
						messages: decodedMsgs,
					},
					auth_info: {
						fee: {
							amount: decodedTx.authInfo.fee?.amount,
							gas_limit: decodedTx.authInfo.fee?.gasLimit,
							granter: decodedTx.authInfo.fee?.granter,
							payer: decodedTx.authInfo.fee?.payer,
						},
						signer_infos: decodedTx.authInfo.signerInfos.map((signerInfo) => {
							const pubkey = signerInfo.publicKey?.value;

							if (pubkey instanceof Uint8Array) {
								return {
									mode_info: signerInfo.modeInfo,
									public_key: {
										'@type': signerInfo.publicKey?.typeUrl,
										key: toBase64(pubkey.slice(2)),
									},
									sequence: signerInfo.sequence.toString(),
								};
							} else {
								return {
									mode_info: signerInfo.modeInfo,
									sequence: signerInfo.sequence.toString(),
								};
							}
						}),
					},
					signatures: decodedTx.signatures,
				};
				// const msg = fromUtf8(tx.tx.body.messages[0].msg);

				tx.tx_response = {
					height: tx.height,
					txhash: tx.hash,
					codespace: tx.tx_result.codespace,
					code: tx.tx_result.code,
					data: tx.tx_result.data,
					raw_log: tx.tx_result.log,
					info: tx.tx_result.info,
					gas_wanted: tx.tx_result.gas_wanted,
					gas_used: tx.tx_result.gas_used,
					tx: tx.tx,
					events: tx.tx_result.events,
					timestamp,
				};
				try {
					tx.tx_response.logs = JSON.parse(tx.tx_result.log);
					// tx.tx.body.messages.map((msg: any) => {
					// 	msg.msg = JSON.parse(fromUtf8(msg.msg));
					// });
				} catch (error) {
					this.logger.debug('tx fail');
				}
			});

			const listTxConvert: TransactionEntity[] = new JsonConvert().deserializeArray(
				listTx.txs,
				TransactionEntity,
			);
			this.broker.emit('list-tx.upsert', {
				listTx: listTxConvert,
				source: CONST_CHAR.CRAWL,
				chainId,
			} as ListTxCreatedParams);
			await this.handleListTransaction(listTxConvert);
		} catch (error) {
			// this.logger.error('Error when handling tx hash: ', tx.tx_response.txhash);
			// if (tx.tx_response.txhash) {
			// 	this.broker.emit('crawl-transaction-hash.retry', {
			// 		txHash: tx.tx_response.txhash,
			// 	} as TransactionHashParam);
			// }
			this.logger.error(error);
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
								// scan all address in msgInput to add index
								self._scanAllAddressInTxInput(msgInput).map((e) => {
									self._addToIndexes(indexes, 'addresses', '', e);
								});
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

	// add type-key-value to indexes array
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

	// convert camelcase to underscore
	private _camelizeKeys(obj: any): any {
		if (Array.isArray(obj)) {
			return obj.map((v: any) => this._camelizeKeys(v));
		} else if (obj != null && obj.constructor === Object) {
			return Object.keys(obj).reduce(
				(result, key) => ({
					...result,
					[_.snakeCase(key)]: this._camelizeKeys(obj[key]),
				}),
				{},
			);
		}
		return obj;
	}

	// scan all address in msg tx
	private _scanAllAddressInTxInput(msg: any): any[] {
		const listAddress: any[] = [];
		if (msg != null && msg.constructor === Object) {
			Object.values(msg).map((value: any) => {
				if (value != null && value.constructor === Object) {
					listAddress.push(...this._scanAllAddressInTxInput(value));
				} else if (Array.isArray(value)) {
					listAddress.push(
						...value.filter((e: any) => {
							Utils.isValidAddress(e);
						}),
					);
				} else {
					if (Utils.isValidAddress(value)) {
						listAddress.push(value);
					}
				}
			});
		}
		return listAddress;
	}
	public async _start() {
		this.logger.info(
			'listAddress is: ',
			this._scanAllAddressInTxInput({
				msg: {
					take: {
						from: 'aura1uh24g2lc8hvvkaaf7awz25lrh5fptthu2dhq0n',
						signature: {
							hrp: 'aura',
							pub_key: 'A9EkWupSnnFmIIEWG7WtMc0Af/9oEuEeSRTKF/bJrCfh',
							signature:
								'38n3IYf9OiMkolI+vPh9H9eFbWEmhjlfO90AYHh95+Q8fWOGw3tfIChraVGHHgpmV5Os9jgrJFPtHHJLaGvk9g==',
						},
						uri: 'https://ipfs.io/ipfs/bafkreigq53wuyqr5g6ercfbydrq3phc3k257t2bdlo26iuysyi6xw2kxxa',
					},
				},
				funds: [],
			}),
		);

		await this.broker.waitForServices(['v1.handle-transaction-upserted']);
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
