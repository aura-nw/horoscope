/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { IAttribute, IEvent, ITransaction } from 'entities';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import {
	URL_TYPE_CONSTANTS,
	EVENT_TYPE,
	ENRICH_TYPE,
	CODEID_MANAGER_ACTION,
	BASE_64_ENCODE,
	CONTRACT_TYPE,
} from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { Utils } from '../../utils/utils';
import { CodeIDStatus } from '../../model/codeid.model';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;

export default class CrawlAccountInfoService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-asset-tx',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbCW721AssetMixin,
				new CallApiMixin().start(),
				new RedisMixin().start(),
			],
			queues: {
				'asset.tx-handle': {
					concurrency: parseInt(Config.CONCURRENCY_ASSET_TX_HANDLER, 10),
					process(job: Job) {
						job.progress(10);
						const url = Utils.getUrlByChainIdAndType(
							job.data.chainId,
							URL_TYPE_CONSTANTS.LCD,
						);

						// @ts-ignore
						this.handleJob(url, job.data.listTx, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			// Events: {
			// 	'list-tx.upsert': {
			// 		Handler: (ctx: any) => {
			// 			This.createJob(
			// 				'asset.tx-handle',
			// 				{
			// 					ListTx: ctx.params.listTx,
			// 					ChainId: ctx.params.chainId,
			// 				},
			// 				{
			// 					RemoveOnComplete: true,
			// 					RemoveOnFail: {
			// 						Count: 10,
			// 					},
			// 				},
			// 			);
			// 			Return;
			// 		},
			// 	},
			// },
		});
	}

	async handleJob(url: string, listTx: ITransaction[], chainId: string): Promise<any[]> {
		try {
			const listContractAndTokenId = this.getContractAndTokenIdFromListTx(listTx);

			if (listContractAndTokenId.length > 0) {
				await Promise.all(
					listContractAndTokenId.map(async (item) => {
						const contractAddress = item.contractAddress;
						const tokenId = item.tokenId;
						const processingFlag = await this.broker.cacher?.get(
							`contract_${chainId}_${contractAddress}_${tokenId}`,
						);
						if (!processingFlag) {
							await this.broker.cacher?.set(
								`contract_${chainId}_${contractAddress}_${tokenId}`,
								true,
								CACHER_INDEXER_TTL,
							);
							const contractInfo = await this.verifyAddressByCodeID(
								url,
								contractAddress,
								chainId,
							);
							if (contractInfo != null) {
								switch (contractInfo.status) {
									case CodeIDStatus.COMPLETED:
										if (
											contractInfo.contractType === CONTRACT_TYPE.CW20 &&
											!tokenId &&
											contractAddress
										) {
											this.createJob(
												'CW20.enrich',
												{
													url,
													address: contractAddress,
													codeId: contractInfo.codeId,
													typeEnrich: ENRICH_TYPE.UPSERT,
													chainId,
												},
												{
													removeOnComplete: true,
													removeOnFail: {
														count: parseInt(
															Config.BULL_JOB_REMOVE_ON_FAIL_COUNT,
															10,
														),
													},
													attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
													backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
												},
											);
										}
										if (
											contractInfo.contractType === CONTRACT_TYPE.CW721 &&
											tokenId &&
											contractAddress
										) {
											this.createJob(
												'CW721.enrich-tokenid',
												{
													url,
													address: contractAddress,
													codeId: contractInfo.codeId,
													typeEnrich: ENRICH_TYPE.UPSERT,
													chainId,
													tokenId,
												},
												{
													removeOnComplete: true,
													removeOnFail: {
														count: parseInt(
															Config.BULL_JOB_REMOVE_ON_FAIL_COUNT,
															10,
														),
													},
													attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
													backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
												},
											);
											this.handleTxBurnCw721Interface(
												listTx,
												chainId,
												CONTRACT_TYPE.CW721,
											);
										}
										if (
											contractInfo.contractType === CONTRACT_TYPE.CW4973 &&
											tokenId &&
											contractAddress
										) {
											this.createJob(
												'CW4973.enrich-tokenid',
												{
													url,
													address: contractAddress,
													codeId: contractInfo.codeId,
													typeEnrich: ENRICH_TYPE.UPSERT,
													chainId,
													tokenId,
												},
												{
													removeOnComplete: true,
													removeOnFail: {
														count: parseInt(
															Config.BULL_JOB_REMOVE_ON_FAIL_COUNT,
															10,
														),
													},
													attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
													backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
												},
											);
											this.handleTxBurnCw721Interface(
												listTx,
												chainId,
												CONTRACT_TYPE.CW4973,
											);
										}
										break;
									case CodeIDStatus.WAITING:
										this.broker.emit(`${contractInfo.contractType}.validate`, {
											url,
											chainId,
											codeId: contractInfo.codeId,
										});
										break;
									case CodeIDStatus.TBD:
										this.broker.emit(`${contractInfo.contractType}.validate`, {
											url,
											chainId,
											codeId: contractInfo.codeId,
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
							// This.logger.debug(`Contract's type does not verify!`, address);
							await this.broker.cacher?.del(
								`contract_${chainId}_${contractAddress}_${tokenId}`,
							);
						}
					}),
				);
				// Await updateInforPromises;
			}
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	getContractAndTokenIdFromListTx(listTx: ITransaction[]) {
		const listContractAndTokenID: any[] = [];
		if (listTx.length > 0) {
			listTx.forEach((tx: ITransaction) => {
				tx.tx_response.events.map((event: IEvent) => {
					const type = event.type.toString();
					const attributes = event.attributes;
					if (type === EVENT_TYPE.WASM) {
						let contractFromEvent: any = null;
						let tokenIdFromEvent: any = null;
						attributes.map((attribute: IAttribute) => {
							const key = attribute.key.toString();
							// eslint-disable-next-line no-underscore-dangle
							if (key === BASE_64_ENCODE._CONTRACT_ADDRESS) {
								const value = fromUtf8(fromBase64(attribute.value.toString()));
								contractFromEvent = value;
							}
							if (key === BASE_64_ENCODE.TOKEN_ID) {
								const value = fromUtf8(fromBase64(attribute.value.toString()));
								tokenIdFromEvent = value;
							}
						});
						listContractAndTokenID.push({
							contractAddress: contractFromEvent,
							tokenId: tokenIdFromEvent,
						});
					} else if (type === EVENT_TYPE.INSTANTIATE) {
						let contractFromEvent: any = null;
						attributes.map((attribute: IAttribute) => {
							const key = attribute.key.toString();
							// eslint-disable-next-line no-underscore-dangle
							if (key === BASE_64_ENCODE._CONTRACT_ADDRESS) {
								const value = fromUtf8(fromBase64(attribute.value.toString()));
								contractFromEvent = value;
							}
						});
						listContractAndTokenID.push({
							contractAddress: contractFromEvent,
							tokenId: null,
						});
					}
				});
			});
		}
		return listContractAndTokenID;
	}

	handleTxBurnCw721Interface(listTx: any[], chainId: string, contractType: string) {
		listTx.map((tx) => {
			const events = tx.tx_response.events;
			const attributes = events.find((x: IEvent) => x.type === EVENT_TYPE.WASM)?.attributes;
			if (attributes) {
				const keyValue = attributes.find(
					(x: IAttribute) =>
						x.key === BASE_64_ENCODE.ACTION && x.value === BASE_64_ENCODE.BURN,
				);
				if (keyValue) {
					const contractAddress = attributes.find(
						// eslint-disable-next-line no-underscore-dangle
						(x: IAttribute) => x.key === BASE_64_ENCODE._CONTRACT_ADDRESS,
					)?.value;
					const tokenId = attributes.find(
						(x: IAttribute) => x.key === BASE_64_ENCODE.TOKEN_ID,
					)?.value;

					this.logger.info(`${fromUtf8(fromBase64(contractAddress))}`);
					this.logger.info(`${fromUtf8(fromBase64(tokenId))}`);
					this.broker.call(`v1.${contractType}.addBurnedToAsset`, {
						chainid: chainId,
						contractAddress: `${fromUtf8(fromBase64(contractAddress))}`,
						tokenId: `${fromUtf8(fromBase64(tokenId))}`,
					});
				}
			}
		});
	}

	async verifyAddressByCodeID(url: string, address: string, chainId: string) {
		const urlGetContractInfo = `${CONTRACT_URI}${address}`;
		const contractInfo = await this.callApiFromDomain(url, urlGetContractInfo);
		if (contractInfo?.contract_info?.code_id !== undefined) {
			const res: any[] = await this.broker.call(CODEID_MANAGER_ACTION.FIND, {
				query: {
					// eslint-disable-next-line camelcase
					code_id: contractInfo.contract_info.code_id,
					'custom_info.chain_id': chainId,
				},
			});
			this.logger.debug('codeid-manager.find res', res);
			if (res.length > 0) {
				if (
					res[0].status === CodeIDStatus.COMPLETED ||
					res[0].status === CodeIDStatus.WAITING ||
					res[0].status === CodeIDStatus.TBD
				) {
					return {
						codeId: contractInfo.contract_info.code_id,
						contractType: res[0].contract_type,
						status: res[0].status,
					};
				} else {
					return null;
				}
			} else {
				return null;
			}
		} else {
			this.logger.error('verifyAddressByCodeID Fail to get token info', urlGetContractInfo);
			return null;
		}
	}

	public async _start() {
		this.getQueue('asset.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('asset.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('asset.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
