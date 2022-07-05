/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { dbAssetMixin } from "../../mixins/dbMixinMongoose";
import { Config } from "../../common";
import { Service, ServiceBroker } from "moleculer";
import { Job } from "bull";
import * as _ from "lodash";
import { URL_TYPE_CONSTANTS, EVENT_TYPE, ASSET_INDEXER_ACTION } from "../../common/constant";
import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { Utils } from "../../utils/utils";
import { Status } from "@Model";
import { Common } from './common';

const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const URL = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
export default class CrawlAccountInfoService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAssetMixin = dbAssetMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAssetTx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'asset.tx-handle',
					},
				),
				this.dbAssetMixin,
				this.callApiMixin,
			],
			queues: {
				'asset.tx-handle': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx);
						job.progress(100);
						return true;
					},
				}
			},
			events: {
				'account-info.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'asset.tx-handle',
							{
								listTx: ctx.params.listTx,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
		})
	}

	async handleJob(listTx: any[]): Promise<any[]> {
		let contractListFromEvent: any[] = [];
		try {
			if (listTx.length > 0) {
				for (const tx of listTx) {
					let log = tx.tx_response.logs[0].events;
					let attributes = log.find(
						(x: any) => x.type == EVENT_TYPE.EXECUTE
					).attributes;
					contractListFromEvent.push(...attributes)
				};
			}
			let contractList = _.map(_.uniqBy(contractListFromEvent, 'value'), 'value');
			this.logger.debug(`contractList ${JSON.stringify(contractList)}`);
			if (contractList.length > 0) {
				const updateInforPromises = await Promise.all(
					contractList.map(async (address) => {
						const processingFlag = await this.broker.cacher?.get(`contract_${address}`);
						if (!processingFlag) {
							await this.broker.cacher?.set(`contract_${address}`, true);
							let code_id = await this.verifyAddressByCodeID(address);
							if (code_id != null) {
								let listTokenIDs: any = await this.broker.call(
									ASSET_INDEXER_ACTION.ACTION_GET_TOKEN_LIST,
									{ code_id, address },
									{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
								);
								this.logger.debug(`listTokenIDs ${JSON.stringify(listTokenIDs)}`);
								if (listTokenIDs != null) {
									const getInforPromises = await Promise.all(
										listTokenIDs.data.tokens.map(async (token_id: String) => {
											let tokenInfo: any = await this.broker.call(
												ASSET_INDEXER_ACTION.ACTION_GET_TOKEN_INFOR,
												{ code_id, address, token_id },
												{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
											);
											if (tokenInfo != null) {
												const asset = await Common.createAssetObject(
													code_id,
													address,
													token_id,
													tokenInfo,
												);
												return await this.broker.call(
													ASSET_INDEXER_ACTION.ASSET_MANAGER_UPSERT,
													asset,
													{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
												);
											}
										}),
									);
									await getInforPromises;
								}
							}
							await this.broker.cacher?.del(`contract_${address}`);
						}
					})
				);
				await updateInforPromises;
			}
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async verifyAddressByCodeID(address: string): Promise<any> {
		let urlGetContractInfo = `${CONTRACT_URI}${address}`;
		let contractInfo = await this.callApiFromDomain(URL, urlGetContractInfo);
		if (contractInfo?.contract_info?.code_id != undefined) {
			return await this.broker
				.call('code_id.checkStatus', { code_id: contractInfo.contract_info.code_id })
				.then((res) => {
					if (res === Status.COMPLETED) {
						return contractInfo.contract_info.code_id;
					} else return null;
				})
				.catch((error) => {
					this.logger.error('call code_id.checkStatus error', error);
					return null;
				});
		} else {
			this.logger.error("Fail to get token info", urlGetContractInfo);
			return null;
		}
	}

	async _start() {
		this.getQueue('asset.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('asset.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('asset.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
