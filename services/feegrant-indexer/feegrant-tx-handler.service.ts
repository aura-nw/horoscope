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
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

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
}
export default class CrawlAccountInfoService extends Service {

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-feegrant-tx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'feegrant.tx-handle',
					},
				),
			],
			queues: {
				'feegrant.tx-handle': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);
						const URL = Utils.getUrlByChainIdAndType(
							job.data.chainId,
							URL_TYPE_CONSTANTS.LCD,
						);

						// @ts-ignore
						this.handleJob(job.data.listTx, job.data.chainId);

						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'feegrant.tx-handle',
							{
								listTx: ctx.params.listTx,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
								removeOnFail: {
									count: 10,
								},
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listTx: ITransaction[], chainId: string): Promise<any[]> {
		let feegrantList: IFeegrantData[] = [];

		try {
			if (listTx.length > 0) {
				for (const tx of listTx) {
					this.logger.debug();
					let payer = tx.tx.auth_info.fee.granter
					const message: any = tx.tx.body.messages[0]
					// if tx is feegrant tx
					if (payer) {
						let events = tx.tx_response.events
						// check case
						if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
							// set feegrant + use another fee grant
							let spend_limit = {} as Coin
							let basic_allowance = message["allowance"]
							this.logger.info(JSON.stringify(basic_allowance))
							while (basic_allowance["@type"] != ALLOWANCE_TYPE.BASIC_ALLOWANCE) {
								basic_allowance = basic_allowance["allowance"]
							}
							this.logger.info(JSON.stringify(basic_allowance))
							if (basic_allowance["spend_limit"].length > 0) {
								spend_limit = basic_allowance["spend_limit"][0] as Coin
							}
							this.logger.info(JSON.stringify(spend_limit))
							let feegrantCreate = {
								action: FEEGRANT_ACTION.CREATE_WITH_FEEGRANT,
								granter: message["granter"] as String,
								grantee: message["grantee"] as String,
								payer,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0],
								tx_hash: tx.tx_response.txhash,
								expiration: message["expiration"],
								type: message["allowance"]["@type"],
								spend_limit
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
								spend_limit: {} as Coin
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
								continue;
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
									spend_limit: {} as Coin
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
									spend_limit: {} as Coin
								}
								feegrantList.push(feegrantUpdate)
							}
						}

					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
						// normal create grant
						let spend_limit = {} as Coin
						let basic_allowance = message["allowance"]
						while (basic_allowance["@type"] != ALLOWANCE_TYPE.BASIC_ALLOWANCE) {
							basic_allowance = basic_allowance["allowance"]
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
							expiration: message["expiration"],
							type: message["allowance"]["@type"],
							spend_limit: spend_limit
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
							spend_limit: {} as Coin
						}
						feegrantList.push(feegrantRevoke)
					}
				}
			}
			feegrantList = _.sortBy(feegrantList, (a) => a.timestamp)
			this.broker.emit('feegrant.upsert', {
				feegrantList,
				chainId
			});

		} catch (error) {
			this.logger.error(error);
		}

		return [];
	}


	async _start() {
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
