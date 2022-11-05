/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { ITransaction } from 'entities';
import { Coin } from 'entities/coin.entity';
import * as _ from 'lodash';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { JsonConvert, OperationMode } from 'json2typescript';
import { Config } from '../../common';
import { ALLOWANCE_TYPE, FEEGRANT_ACTION, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';
import { CustomInfo } from 'entities/custom-info.entity';
import { QueueConfig } from '../../config/queue';
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };
const util = require('util');

export interface IFeegrantData {
	action: String,
	payer: String,
	grantee: String,
	granter: String,
	result: Boolean,
	timestamp: Date | null,
	amount: Coin,
	tx_hash: String,
	expiration: String | null,
	type: String,
	spend_limit: Coin,
	expired: Boolean,
	custom_info: CustomInfo
}
export default class FeegrantTxHandler extends Service {
	private redisMixin = new RedisMixin().start();
	private dbTransactionMixin = dbTransactionMixin;
	private currentBlock = 0
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-feegrant-tx',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbTransactionMixin,
				this.redisMixin
			],
			queues: {
				'feegrant.tx-handle': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);

						// @ts-ignore
						const list: any[] = await this.handleJob(job.data.chainId);

						job.progress(100);
						return true;
					},
				},
			}
		});
	}

	async initEnv() {
		//get feegrant latest block which was unprocessing
		let handledBlockRedis = await this.redisClient.get(Config.REDIS_KEY_CURRENT_FEEGRANT_BLOCK);
		this.currentBlock = 0;
		this.currentBlock = handledBlockRedis ? parseInt(handledBlockRedis) : this.currentBlock;
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
		this.logger.info(`Feegrant from  ${this.currentBlock} to ${(this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) < latestBlock ? this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) : latestBlock)}`)
		// get all transactions in BLOCK_PER_BATCH sequence blocks, start from currentBlock
		const listTx = await this.adapter.lean({
			query: {
				"tx_response.height": {
					$gte: this.currentBlock,
					$lt: this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) < latestBlock ? this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) : latestBlock
				}
			},
			projection: {
				"tx.body.messages": 1,
				"tx.auth_info": 1,
				"tx_response.events": 1,
				"tx_response.code": 1,
				"tx_response.timestamp": 1,
				"tx_response.txhash": 1,
			}
		}) as ITransaction[]
		// filter feegrant transactions
		if (listTx.length > 0) {
			for (const tx of listTx) {
				let payer = tx.tx.auth_info.fee.granter
				tx.tx.body.messages.forEach((message: any) => {
					// if tx is feegrant tx
					if (payer) {
						let events = tx.tx_response.events
						// check case
						if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
							// set feegrant + use another fee grant
							let spend_limit = {} as Coin
							let basic_allowance = message["allowance"]
							while (basic_allowance["@type"] != ALLOWANCE_TYPE.BASIC_ALLOWANCE && basic_allowance["@type"] != ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
								basic_allowance = basic_allowance["allowance"]
							}
							if (basic_allowance["@type"] == ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
								basic_allowance = basic_allowance["basic"]
							}
							if (basic_allowance["spend_limit"].length > 0) {
								spend_limit = basic_allowance["spend_limit"][0] as Coin
							}
							let feegrantCreate = {
								action: FEEGRANT_ACTION.CREATE_WITH_FEEGRANT,
								granter: message["granter"] as String,
								grantee: message["grantee"] as String,
								payer,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0],
								tx_hash: tx.tx_response.txhash,
								expiration: basic_allowance["expiration"],
								type: message["allowance"]["@type"],
								spend_limit,
								custom_info: tx.custom_info,
								expired: false
							}
							feegrantList.push(feegrantCreate)
						} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
							// revoke feegrant  + use another fee grant
							let feegrantRevoke = {
								action: FEEGRANT_ACTION.REVOKE_WITH_FEEGRANT,
								granter: message["granter"] as String,
								grantee: message["grantee"] as String,
								payer,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0],
								tx_hash: tx.tx_response.txhash,
								expiration: null,
								type: "",
								spend_limit: {} as Coin,
								custom_info: tx.custom_info,
								expired: false
							}
							feegrantList.push(feegrantRevoke)
						} else {
							// get the owner of tx
							let owner = ""
							try {
								switch (message['@type']) {
									case MSG_TYPE.MSG_SEND:
										owner =
											message.from_address
										break;
									case MSG_TYPE.MSG_DELEGATE:
										owner = message.delegator_address;
										break;
									case MSG_TYPE.MSG_REDELEGATE:
										owner = message.delegator_address
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
								return
							}
							if (events.find(e => e.type === "revoke_feegrant")) {
								// use up
								let feegrantUseup = {
									action: FEEGRANT_ACTION.USE_UP,
									granter: payer,
									grantee: owner,
									result: tx.tx_response.code.toString() === "0",
									timestamp: tx.tx_response.timestamp,
									amount: tx.tx.auth_info.fee.amount[0],
									payer,
									tx_hash: tx.tx_response.txhash,
									expiration: null,
									type: "",
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false
								}
								feegrantList.push(feegrantUseup)
							} else {
								// default: just use
								let feegrantUpdate = {
									action: FEEGRANT_ACTION.USE,
									payer,
									grantee: owner,
									granter: payer,
									result: tx.tx_response.code.toString() === "0",
									timestamp: tx.tx_response.timestamp,
									amount: tx.tx.auth_info.fee.amount[0] as Coin,
									tx_hash: tx.tx_response.txhash,
									expiration: null,
									type: "",
									spend_limit: {} as Coin,
									custom_info: tx.custom_info,
									expired: false
								}
								feegrantList.push(feegrantUpdate)
							}
						}

					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
						// normal create grant
						let spend_limit = {} as Coin
						let basic_allowance = message["allowance"]
						while (basic_allowance["@type"] != ALLOWANCE_TYPE.BASIC_ALLOWANCE && basic_allowance["@type"] != ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
							basic_allowance = basic_allowance["allowance"]
						}
						if (basic_allowance["@type"] == ALLOWANCE_TYPE.PERIODIC_ALLOWANCE) {
							basic_allowance = basic_allowance["basic"]
						}
						if (basic_allowance["spend_limit"].length > 0) {
							spend_limit = basic_allowance["spend_limit"][0] as Coin
						}
						let feegrantCreate = {
							action: FEEGRANT_ACTION.CREATE,
							granter: message["granter"],
							grantee: message["grantee"],
							result: tx.tx_response.code.toString() === "0",
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0] as Coin,
							payer,
							tx_hash: tx.tx_response.txhash,
							expiration: basic_allowance["expiration"],
							type: message["allowance"]["@type"],
							spend_limit: spend_limit,
							custom_info: tx.custom_info,
							expired: false
						}
						feegrantList.push(feegrantCreate)
					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
						let feegrantRevoke = {
							action: FEEGRANT_ACTION.REVOKE,
							granter: message["granter"],
							grantee: message["grantee"],
							result: tx.tx_response.code.toString() === "0",
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0] as Coin,
							payer,
							tx_hash: tx.tx_response.txhash,
							expiration: null,
							type: "",
							spend_limit: {} as Coin,
							custom_info: tx.custom_info,
							expired: false
						}
						feegrantList.push(feegrantRevoke)
					}
				})

			}
		}
		// forward to feegrant history db service
		this.createJob(
			'feegrant.history-db',
			{
				feegrantList,
				chainId
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
			},
		);
		// update feegrant latest block
		this.currentBlock = this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) < latestBlock ? this.currentBlock + parseInt(Config.BLOCK_PER_BATCH) : latestBlock
		this.redisClient.set(Config.REDIS_KEY_CURRENT_FEEGRANT_BLOCK, this.currentBlock);
		this.logger.info(JSON.stringify(feegrantList))
		return feegrantList;
	}


	async _start() {
		this.redisClient = await this.getRedisClient();
		this.createJob(
			'feegrant.tx-handle',
			{
				chainId: Config.CHAIN_ID
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
		await this.initEnv()
		this.getQueue('feegrant.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('feegrant.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('feegrant.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
