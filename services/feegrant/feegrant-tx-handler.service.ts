/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { ITransaction } from 'entities';
import { Coin } from 'entities/coin.entity';
import { Service, ServiceBroker } from 'moleculer';
import { CustomInfo } from 'entities/custom-info.entity';
import { Config } from '../../common';
import { ALLOWANCE_TYPE, FEEGRANT_ACTION, MSG_TYPE } from '../../common/constant';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export interface IFeegrantData {
	action: string;
	payer: string;
	grantee: string;
	granter: string;
	result: boolean;
	timestamp: Date | null;
	amount: Coin;
	tx_hash: string;
	expiration: string | null;
	type: string;
	spend_limit: Coin;
	expired: boolean;
	custom_info: CustomInfo;
}
export default class FeegrantTxHandler extends Service {
	private redisMixin = new RedisMixin().start();
	private dbTransactionMixin = dbTransactionMixin;
	private currentBlock = 0
	private syncCatchUp = false
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'feegrantTxHandler',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbTransactionMixin,
				new RedisMixin().start(),
			],
			queues: {
				'feegrant.tx-handle': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.initEnv();
						// @ts-ignore
						await this.handleJob(job.data.chainId);

						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async initEnv() {
		// Get feegrant latest block which was unprocessing
		const handledBlockRedis = await this.redisClient.get(
			Config.REDIS_KEY_CURRENT_FEEGRANT_BLOCK,
		);
		this._currentBlock = 0;
		// Oldest block in Tx DB
		const oldestBlockTx = (await this.adapter.lean({
			sort: 'tx_response.height',
			limit: 1,
			projection: {
				'tx_response.height': 1,
			},
		})) as ITransaction[];
		this._currentBlock = oldestBlockTx[0]
			? oldestBlockTx[0].tx_response.height.valueOf() - 1
			: -1;
		this._currentBlock = handledBlockRedis
			? parseInt(handledBlockRedis, 10)
			: this._currentBlock;
	}

	async handleJob(chainId: string): Promise<any[]> {
		let feegrantList: IFeegrantData[] = [];
		// latest block in transaction DB
		const latestBlockTx = await this.adapter.lean({
			sort: "-tx_response.height",
			limit: 1,
			projection: {
				"tx_response.height": 1
			},
		}) as ITransaction[]
		const latestBlock = latestBlockTx[0] ? latestBlockTx[0].tx_response.height.valueOf() : this.currentBlock
		const fromBlock = this.currentBlock
		let toBlock = this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) < latestBlock ? this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) : latestBlock
		if (fromBlock >= toBlock) {
			this.syncCatchUp = true
		}
		if (this.syncCatchUp) {
			toBlock = latestBlock
		}
		this.logger.info(`Feegrant from  ${fromBlock} to ${toBlock}`)
		// get all transactions in BLOCK_PER_BATCH sequence blocks, start from fromBlock: fromBlock+1, fromBlock+2,..., toBlock
		const listTx = await this.adapter.lean({
			query: {
				"tx_response.height": {
					$gt: fromBlock,
					$lte: toBlock
				}
			},
			projection: {
				'tx.body.messages': 1,
				'tx.auth_info': 1,
				'tx_response.events': 1,
				'tx_response.code': 1,
				'tx_response.timestamp': 1,
				'tx_response.txhash': 1,
			},
		})) as ITransaction[];
		// Filter feegrant transactions
		if (listTx.length > 0) {
			for (const tx of listTx) {
				const payer = tx.tx.auth_info.fee.granter.toString();
				tx.tx.body.messages.forEach((message: any) => {
					// If tx is feegrant tx
					if (payer) {
						const events = tx.tx_response.events;
						// Check case
						if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
							// Set feegrant + use another fee grant
							let spend_limit = {} as Coin;
							let basic_allowance = message.allowance;
							while (
								basic_allowance['@type'] !== ALLOWANCE_TYPE.BASIC_ALLOWANCE &&
								basic_allowance['@type'] !== ALLOWANCE_TYPE.PERIODIC_ALLOWANCE
							) {
								basic_allowance = basic_allowance.allowance;
							}
							const type = basic_allowance['@type'];
							if (basic_allowance['@type'] === ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
								basic_allowance = basic_allowance.basic;
							}
							if (basic_allowance.spend_limit.length > 0) {
								spend_limit = basic_allowance.spend_limit[0] as Coin;
							}
							const feegrantCreate = {
								action: FEEGRANT_ACTION.CREATE_WITH_FEEGRANT,
								granter: message.granter as string,
								grantee: message.grantee as string,
								payer,
								result: tx.tx_response.code.toString() === '0',
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0],
								tx_hash: tx.tx_response.txhash.toString(),
								expiration: basic_allowance.expiration,
								type,
								spend_limit,
								custom_info: tx.custom_info,
								expired: false,
							};
							if (events.find((e) => e.type === 'revoke_feegrant')) {
								// Use up
								const feegrantUseup = {
									action: FEEGRANT_ACTION.USE_UP,
									granter: payer,
									grantee: message.granter,
									result: tx.tx_response.code.toString() === '0',
									timestamp: tx.tx_response.timestamp,
									amount: {
										amount: '0',
										denom: '',
									},
									payer,
									tx_hash: tx.tx_response.txhash.toString(),
									expiration: null,
									type: '',
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false,
								};
								feegrantList.push(feegrantUseup);
							}
							feegrantList.push(feegrantCreate);
						} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
							// Revoke feegrant  + use another fee grant
							const feegrantRevoke = {
								action: FEEGRANT_ACTION.REVOKE_WITH_FEEGRANT,
								granter: message.granter as string,
								grantee: message.grantee as string,
								payer,
								result: tx.tx_response.code.toString() === '0',
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0],
								tx_hash: tx.tx_response.txhash.toString(),
								expiration: null,
								type: '',
								spend_limit: {} as Coin,
								custom_info: tx.custom_info,
								expired: false,
							};
							if (events[0].type === 'revoke_feegrant') {
								// Use up
								const feegrantUseup = {
									action: FEEGRANT_ACTION.USE_UP,
									granter: payer,
									grantee: message.granter as string,
									result: tx.tx_response.code.toString() === '0',
									timestamp: tx.tx_response.timestamp,
									amount: {
										amount: '0',
										denom: '',
									},
									payer,
									tx_hash: tx.tx_response.txhash.toString(),
									expiration: null,
									type: '',
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false,
								};
								feegrantList.push(feegrantUseup);
							}
							feegrantList.push(feegrantRevoke);
						} else {
							// Get the owner of tx
							let owner = '';
							try {
								switch (message['@type']) {
									case MSG_TYPE.MSG_SEND:
										owner = message.from_address;
										break;
									case MSG_TYPE.MSG_DELEGATE:
										owner = message.delegator_address;
										break;
									case MSG_TYPE.MSG_REDELEGATE:
										owner = message.delegator_address;
										break;
									case MSG_TYPE.MSG_UNDELEGATE:
										owner = message.delegator_address;
										break;
									case MSG_TYPE.MSG_EXECUTE_CONTRACT:
										owner = message.sender;
										break;
									case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
										owner = message.sender;
										break;
									case MSG_TYPE.MSG_STORE_CODE:
										owner = message.sender;
										break;
									case MSG_TYPE.MSG_CREATE_VESTING_ACCOUNT:
										owner = message.from_address;
										break;
									case MSG_TYPE.MSG_DEPOSIT:
										owner = message.depositor;
										break;
									case MSG_TYPE.MSG_WITHDRAW_REWARDS:
										owner = message.delegator_address;
										break;
									case MSG_TYPE.MSG_SUBMIT_PROPOSAL:
										owner = message.proposer;
										break;
									case MSG_TYPE.MSG_VOTE:
										owner = message.voter;
										break;
									case MSG_TYPE.MSG_IBC_TRANSFER:
										owner = message.sender;
										break;
									case MSG_TYPE.MSG_FEEGRANT_GRANT:
										owner = message.granter;
										break;
									case MSG_TYPE.MSG_FEEGRANT_REVOKE:
										owner = message.granter;
										break;
								}
							} catch (error) {
								this.logger.error(`Error when get message type: ${error}`);
								return;
							}
							if (events.find((e) => e.type === 'revoke_feegrant')) {
								// Use up
								const feegrantUseup = {
									action: FEEGRANT_ACTION.USE_UP,
									granter: payer,
									grantee: owner,
									result: tx.tx_response.code.toString() === '0',
									timestamp: tx.tx_response.timestamp,
									amount: tx.tx.auth_info.fee.amount[0],
									payer,
									tx_hash: tx.tx_response.txhash.toString(),
									expiration: null,
									type: '',
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false,
								};
								feegrantList.push(feegrantUseup);
							} else {
								// Default: just use
								const feegrantUpdate = {
									action: FEEGRANT_ACTION.USE,
									payer,
									grantee: owner,
									granter: payer,
									result: tx.tx_response.code.toString() === '0',
									timestamp: tx.tx_response.timestamp,
									amount: tx.tx.auth_info.fee.amount[0] as Coin,
									tx_hash: tx.tx_response.txhash.toString(),
									expiration: null,
									type: '',
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false,
								};
								feegrantList.push(feegrantUpdate);
							}
						}
					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
						// Normal create grant
						let spend_limit = {} as Coin;
						let basic_allowance = message.allowance;
						while (
							basic_allowance['@type'] !== ALLOWANCE_TYPE.BASIC_ALLOWANCE &&
							basic_allowance['@type'] !== ALLOWANCE_TYPE.PERIODIC_ALLOWANCE
						) {
							basic_allowance = basic_allowance.allowance;
						}
						const type = basic_allowance['@type'];
						if (basic_allowance['@type'] === ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
							basic_allowance = basic_allowance.basic;
						}
						if (basic_allowance.spend_limit.length > 0) {
							spend_limit = basic_allowance.spend_limit[0] as Coin;
						}
						const feegrantCreate = {
							action: FEEGRANT_ACTION.CREATE,
							granter: message.granter,
							grantee: message.grantee,
							result: tx.tx_response.code.toString() === '0',
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0] as Coin,
							payer,
							tx_hash: tx.tx_response.txhash.toString(),
							expiration: basic_allowance.expiration,
							type,
							spend_limit,
							custom_info: tx.custom_info,
							expired: false,
						};
						feegrantList.push(feegrantCreate);
					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
						const feegrantRevoke = {
							action: FEEGRANT_ACTION.REVOKE,
							granter: message.granter,
							grantee: message.grantee,
							result: tx.tx_response.code.toString() === '0',
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0] as Coin,
							payer,
							tx_hash: tx.tx_response.txhash.toString(),
							expiration: null,
							type: '',
							spend_limit: {} as Coin,
							custom_info: tx.custom_info,
							expired: false,
						};
						feegrantList.push(feegrantRevoke);
					}
				});
			}
		}
		// Forward to feegrant history db service
		if (process.env.NODE_ENV !== 'test') {
			this.createJob(
				'feegrant.history-db',
				{
					feegrantList,
					chainId,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
				},
			);
		}
		// update feegrant latest block
		this.currentBlock = toBlock
		this.redisClient.set(Config.REDIS_KEY_CURRENT_FEEGRANT_BLOCK, this.currentBlock);
		this.logger.info(JSON.stringify(feegrantList))
		return feegrantList;
	}

	public async _start() {
		this.redisClient = await this.getRedisClient();
		if (process.env.NODE_ENV !== 'test') {
			this.createJob(
				'feegrant.tx-handle',
				{
					chainId: Config.CHAIN_ID,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
					repeat: {
						every: parseInt(Config.MILISECOND_PER_BATCH, 10),
					},
				},
			);
		}
		this.getQueue('feegrant.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('feegrant.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('feegrant.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
