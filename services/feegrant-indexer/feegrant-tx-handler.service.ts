/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { ITransaction } from 'entities';
import * as _ from 'lodash';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

interface IFeegrantData {
	action: String,
	payer: String,
	grantee: String,
	granter: String,
	result: Boolean,
	timestamp: Date | null,
	amount: String
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
					concurrency: parseInt(Config.CONCURRENCY_FEEGRANT_TX_HANDLER, 10),
					process(job: Job) {
						job.progress(10);
						const URL = Utils.getUrlByChainIdAndType(
							job.data.chainId,
							URL_TYPE_CONSTANTS.LCD,
						);

						// @ts-ignore
						this.handleJob(URL, job.data.listTx, job.data.chainId);

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

	async handleJob(URL: string, listTx: ITransaction[], chainId: string): Promise<any[]> {
		let feegrantList: IFeegrantData[] = [];
		try {
			if (listTx.length > 0) {
				for (const tx of listTx) {
					this.logger.debug('tx', JSON.stringify(tx));
					let payer = tx.tx.auth_info.fee.granter
					const message: any = tx.tx.body.messages[0]
					// if tx is feegrant tx
					if (payer) {
						// get the owner of tx
						let grantee = ""
						let granter = ""
						try {
							switch (message['@type']) {
								case MSG_TYPE.MSG_SEND:
									grantee =
										message.from_address
									break;
								case MSG_TYPE.MSG_DELEGATE:
									grantee = message.delegator_address;
									break;
								case MSG_TYPE.MSG_REDELEGATE:
									grantee = message.delegator_address
									break;
								case MSG_TYPE.MSG_UNDELEGATE:
									grantee = message.delegator_address;
									break;
								case MSG_TYPE.MSG_EXECUTE_CONTRACT:
									grantee = message.sender;
									break;
								case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
									grantee = message.sender;
									break;
								case MSG_TYPE.MSG_STORE_CODE:
									grantee = message.sender;
									break;
								case MSG_TYPE.MSG_CREATE_VESTING_ACCOUNT:
									grantee = message.from_address;
									break;
								case MSG_TYPE.MSG_DEPOSIT:
									grantee = message.depositor;
									break;
								case MSG_TYPE.MSG_WITHDRAW_REWARDS:
									grantee = message.delegator_address;
									break;
								case MSG_TYPE.MSG_SUBMIT_PROPOSAL:
									grantee = message.proposer;
									break;
								case MSG_TYPE.MSG_VOTE:
									grantee = message.voter;
									break;
								case MSG_TYPE.MSG_IBC_TRANSFER:
									grantee = message.sender;
									break;
								case MSG_TYPE.MSG_FEEGRANT_GRANT:
									grantee = message.granter;
									break;
								case MSG_TYPE.MSG_FEEGRANT_REVOKE:
									grantee = message.granter;
									break;
							}
						} catch (error) {
							this.logger.error(`Error when get message type: ${error}`);
							continue;
						}

						let events = tx.tx_response.events
						// check case
						if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
							// set feegrant + use another fee grant
							let feegrantCreate = {
								action: "create",
								granter: message["granter"] as String,
								grantee: message["grantee"] as String,
								payer,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0].amount
							}
							feegrantList.push(feegrantCreate)
						} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
							// revoke feegrant  + use another fee grant
							let feegrantRevoke = {
								action: "revoke",
								granter: message["granter"] as String,
								grantee: message["grantee"] as String,
								payer,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0].amount
							}
							feegrantList.push(feegrantRevoke)
						} else if (events.find(e => e.type === "revoke_feegrant")) {
							// use up
							let feegrantUseup = {
								action: "useup",
								granter: message["granter"],
								grantee: message["grantee"],
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0].amount,
								payer
							}
							feegrantList.push(feegrantUseup)
						} else {
							// default: just use
							let feegrantUpdate = {
								action: "update",
								payer,
								grantee,
								granter,
								result: tx.tx_response.code.toString() === "0",
								timestamp: tx.tx_response.timestamp,
								amount: tx.tx.auth_info.fee.amount[0].amount
							}
							feegrantList.push(feegrantUpdate)
						}

					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_GRANT) {
						let feegrantCreate = {
							action: "create",
							granter: message["granter"],
							grantee: message["grantee"],
							result: tx.tx_response.code.toString() === "0",
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0].amount,
							payer
						}
						feegrantList.push(feegrantCreate)
					} else if (message['@type'] === MSG_TYPE.MSG_FEEGRANT_REVOKE) {
						let feegrantRevoke = {
							action: "revoke",
							granter: message["granter"],
							grantee: message["grantee"],
							result: tx.tx_response.code.toString() === "0",
							timestamp: tx.tx_response.timestamp,
							amount: tx.tx.auth_info.fee.amount[0].amount,
							payer,
						}
						feegrantList.push(feegrantRevoke)
					}
				}
			}
			_.sortBy(feegrantList, (a) => a.timestamp)
			console.log(feegrantList);
			this.broker.emit('feegrant.upsert', {
				feegrantList
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
