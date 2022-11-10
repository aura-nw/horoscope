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
	BASE_64_ENCODE,
} from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Utils } from '../../utils/utils';
import { CodeIDStatus } from '../../model/codeid.model';
import { ICW721Asset } from '../../entities/cw721-asset.entity';
import { info } from 'console';
import { IAttribute, IEvent, ITransaction } from 'entities';
import { toBase64, toUtf8, fromBase64, fromUtf8 } from '@cosmjs/encoding';
import { Action } from '@ourparentcenter/moleculer-decorators-extended';
import { QueueConfig } from '../../config/queue';
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
				QueueService(QueueConfig.redis, QueueConfig.opts),
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
						// @ts-ignore
						this.handleTxBurnCw721(job.data.listTx, job.data.chainId);
						// TODO: handleTxBurnCw4973 ???
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
		try {
			const listContractAndTokenId = this.getContractAndTokenIdFromListTx(listTx);

			if (listContractAndTokenId.length > 0) {
				const updateInforPromises = await Promise.all(
					listContractAndTokenId.map(async (item) => {
						const contractAddress = item.contractAddress;
						const tokenId = item.tokenId;
						const processingFlag = await this.broker.cacher?.get(
							`contract_${chainId}_${contractAddress}`,
						);
						if (!processingFlag) {
							await this.broker.cacher?.set(
								`contract_${chainId}_${contractAddress}`,
								true,
							);
							let contractInfo = await this.verifyAddressByCodeID(
								URL,
								contractAddress,
								chainId,
							);
							if (contractInfo != null) {
								switch (contractInfo.status) {
									case CodeIDStatus.COMPLETED:
										if (!tokenId && contractAddress) {
											await this.broker.call(
												`v1.${contractInfo.contract_type}.enrichData`,
												[
													{
														URL,
														chain_id: chainId,
														code_id: contractInfo.code_id,
														contractAddress,
													},
													ENRICH_TYPE.UPSERT,
												],
												OPTs,
											);
										}
										if (tokenId && contractAddress) {
											this.createJob(
												'CW721.enrich-tokenid',
												{
													url: URL,
													address: contractAddress,
													code_id: contractInfo.code_id,
													type_enrich: ENRICH_TYPE.UPSERT,
													chain_id: chainId,
													token_id: tokenId,
												},
												{
													removeOnComplete: true,
													removeOnFail: {
														count: 3,
													},
												},
											);
										}
										break;
									case CodeIDStatus.WAITING:
										this.broker.emit(`${contractInfo.contract_type}.validate`, {
											URL,
											chain_id: chainId,
											code_id: contractInfo.code_id,
										});
										break;
									case CodeIDStatus.TBD:
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
							await this.broker.cacher?.del(`contract_${chainId}_${contractAddress}`);
						}
					}),
				);
				// await updateInforPromises;
			}
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	getContractAndTokenIdFromListTx(listTx: ITransaction[]) {
		let listContractAndTokenID: any[] = [];
		if (listTx.length > 0) {
			listTx.forEach((tx: ITransaction) => {
				tx.tx_response.events.map((event: IEvent) => {
					const type = event.type.toString();
					const attributes = event.attributes;
					if (type == EVENT_TYPE.WASM) {
						let contractFromEvent: any = null;
						let tokenIdFromEvent: any = null;
						attributes.map((attribute: IAttribute) => {
							const key = attribute.key.toString();
							if (key == BASE_64_ENCODE._CONTRACT_ADDRESS) {
								const value = fromUtf8(fromBase64(attribute.value.toString()));
								contractFromEvent = value;
							}
							if (key == BASE_64_ENCODE.TOKEN_ID) {
								const value = fromUtf8(fromBase64(attribute.value.toString()));
								tokenIdFromEvent = value;
							}
						});
						listContractAndTokenID.push({
							contractAddress: contractFromEvent,
							tokenId: tokenIdFromEvent,
						});
					}
				});
			});
		}
		return listContractAndTokenID;
	}

	handleTxBurnCw721(listTx: any[], chainId: string) {
		listTx.map((tx) => {
			const events = tx.tx_response.events;
			const attributes = events.find((x: IEvent) => x.type == EVENT_TYPE.WASM)?.attributes;
			if (attributes) {
				const key_value = attributes.find(
					(x: IAttribute) =>
						x.key == BASE_64_ENCODE.ACTION && x.value == BASE_64_ENCODE.BURN,
				);
				if (key_value) {
					const contract_address = attributes.find(
						(x: IAttribute) => x.key == BASE_64_ENCODE._CONTRACT_ADDRESS,
					)?.value;
					const tokenId = attributes.find(
						(x: IAttribute) => x.key == BASE_64_ENCODE.TOKEN_ID,
					)?.value;

					this.logger.info(`${fromUtf8(fromBase64(contract_address))}`);
					this.logger.info(`${fromUtf8(fromBase64(tokenId))}`);
					this.broker.call('v1.CW721.addBurnedToAsset', {
						chainid: chainId,
						contractAddress: `${fromUtf8(fromBase64(contract_address))}`,
						tokenId: `${fromUtf8(fromBase64(tokenId))}`,
					});
				}
			}
		});
	}

	// TODO: handleTxBurnCw4973 ???

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
				if (
					res[0].status === CodeIDStatus.COMPLETED ||
					res[0].status === CodeIDStatus.WAITING ||
					res[0].status === CodeIDStatus.TBD
				) {
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
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('asset.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
