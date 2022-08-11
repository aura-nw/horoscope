/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import * as _ from 'lodash';
import {
	URL_TYPE_CONSTANTS,
	EVENT_TYPE,
	COMMON_ACTION,
	ENRICH_TYPE,
	CODEID_MANAGER_ACTION,
} from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Utils } from '../../utils/utils';
import { Status } from '../../model';
import { info } from 'console';
import { ITransaction } from 'entities';

const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

export default class CrawlAccountInfoService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAssetMixin = dbCW721AssetMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-asset-tx',
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
					concurrency: parseInt(Config.CONCURRENCY_ASSET_TX_HANDLER, 10),
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
							'asset.tx-handle',
							{
								listTx: ctx.params.listTx,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(URL: string, listTx: ITransaction[], chainId: string): Promise<any[]> {
		let contractListFromEvent: any[] = [];
		try {
			if (listTx.length > 0) {
				for (const tx of listTx) {
					this.logger.debug('tx', JSON.stringify(tx));
					let log = tx.tx_response.logs[0];
					if (log && log.events) {
						let events = log.events;
						let attributes = events.find(
							(x: any) => x.type == EVENT_TYPE.EXECUTE,
						)?.attributes;
						if (attributes) {
							contractListFromEvent.push(...attributes);
						}
					}
				}
			}
			let contractList = _.map(_.uniqBy(contractListFromEvent, 'value'), 'value');
			this.logger.debug(`contractList ${JSON.stringify(contractList)}`);
			if (contractList.length > 0) {
				const updateInforPromises = await Promise.all(
					contractList.map(async (address) => {
						const processingFlag = await this.broker.cacher?.get(`contract_${address}`);
						if (!processingFlag) {
							await this.broker.cacher?.set(`contract_${chainId}_${address}`, true);
							let contractInfo = await this.verifyAddressByCodeID(
								URL,
								address,
								chainId,
							);
							if (contractInfo != null) {
								this.logger.info('contractInfo', contractInfo);
								switch (contractInfo.status) {
									case Status.COMPLETED:
										await this.broker.call(
											`v1.${contractInfo.contract_type}.enrichData`,
											[
												{
													URL,
													chain_id: chainId,
													code_id: contractInfo.code_id,
													address,
												},
												ENRICH_TYPE.UPSERT,
											],
											OPTs,
										);
										break;
									case Status.TBD:
										this.logger.info('contractInfo TBD', contractInfo.status);
										this.broker.emit(`${contractInfo.contract_type}.validate`, {
											URL,
											chain_id: chainId,
											code_id: contractInfo.code_id,
										});
										break;
									default:
										this.logger.error(
											'handleJob tx fail, status does not match',
											contractInfo.status,
										);
										break;
								}
							}
							// this.logger.debug(`Contract's type does not verify!`, address);
							await this.broker.cacher?.del(`contract_${chainId}_${address}`);
						}
					}),
				);
				await updateInforPromises;
			}
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async verifyAddressByCodeID(URL: string, address: string, chain_id: string) {
		let urlGetContractInfo = `${CONTRACT_URI}${address}`;
		let contractInfo = await this.callApiFromDomain(URL, urlGetContractInfo);
		if (contractInfo?.contract_info?.code_id != undefined) {
			const res: any[] = await this.broker.call(CODEID_MANAGER_ACTION.FIND, {
				query: {
					code_id: contractInfo.contract_info.code_id,
					'custom_info.chain_id': chain_id,
				},
			});
			this.logger.debug('codeid-manager.find res', res);
			if (res.length > 0) {
				if (res[0].status === Status.COMPLETED || res[0].status === Status.TBD) {
					return {
						code_id: contractInfo.contract_info.code_id,
						contract_type: res[0].contract_type,
						status: res[0].status,
					};
				} else return null;
			} else {
				return null;
			}
		} else {
			this.logger.error('verifyAddressByCodeID Fail to get token info', urlGetContractInfo);
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
