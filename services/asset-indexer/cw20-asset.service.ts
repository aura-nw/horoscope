/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import moleculer, { CallingOptions, Context } from 'moleculer';
import { Action, Event, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { Job } from 'bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { CodeIDStatus } from '../../model/codeid.model';
import { Config } from '../../common';
import {
	CODEID_MANAGER_ACTION,
	COMMON_ACTION,
	CONTRACT_TYPE,
	CW20_ACTION,
	ENRICH_TYPE,
} from '../../common/constant';
import { queueConfig } from '../../config/queue';
import { Common, ITokenInfo } from './common.service';
const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const opts: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

const VALIDATE_CODEID_PREFIX = 'validate_codeid';
const HANDLE_CODEID_PREFIX = 'handle_codeid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW20',
	version: 1,
	mixins: [new CallApiMixin().start(), queueService(queueConfig.redis, queueConfig.opts)],
	queues: {
		'CW20.enrich': {
			concurrency: parseInt(Config.CONCURRENCY_ENRICH_CW20, 10),
			async process(job: Job) {
				job.progress(10);
				const url = job.data.url;
				const address = job.data.address;
				const codeId = job.data.codeId;
				const chainId = job.data.chainId;
				const typeEnrich = job.data.typeEnrich;
				// @ts-ignore
				await this.broker.waitForServices(['v1.CW20-asset-manager']);
				// @ts-ignore
				await this.handleJobEnrichData(url, address, codeId, typeEnrich, chainId);
			},
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	@Action({ name: 'getOwnerList' })
	private async _getOwnerList(ctx: Context<ITokenInfo>) {
		const url = ctx.params.url;
		const address = ctx.params.address;
		try {
			let doneLoop = false;
			const listOwnerAddress = [];
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${toBase64(
				toUtf8('{"all_accounts": {"limit":100}}'),
			)}`;

			while (!doneLoop) {
				this.logger.debug('param call lcd: ', JSON.stringify(urlGetListToken));
				const resultCallApi = await this.callApiFromDomain(url, urlGetListToken);
				if (resultCallApi?.data?.accounts?.length > 0) {
					listOwnerAddress.push(...resultCallApi.data.accounts);
					const lastAddress =
						resultCallApi.data.accounts[resultCallApi.data.accounts.length - 1];

					urlGetListToken = `${CONTRACT_URI}${address}/smart/${toBase64(
						toUtf8(`{"all_accounts": {"limit":100, "start_after":"${lastAddress}"}}`),
					)}`;
				} else {
					doneLoop = true;
				}
			}
			this.logger.debug('url: ', JSON.stringify(url));
			this.logger.debug('address: ', address);
			this.logger.debug('listOwner: ', JSON.stringify(listOwnerAddress));
			if (listOwnerAddress.length > 0) {
				return listOwnerAddress;
			} else {
				return null;
			}
		} catch (error) {
			this.logger.error('getOwnerList error', error);
		}
		return null;
	}

	@Action({ name: 'getBalance' })
	private async _getBalance(ctx: Context<ITokenInfo>) {
		const url = ctx.params.url;
		try {
			const str = `{"balance":{"address": "${ctx.params.owner}"}}`;
			const stringEncode64bytes = Buffer.from(str).toString('base64');
			const urlGetBalance = `${CONTRACT_URI}${ctx.params.address}/smart/${stringEncode64bytes}`;
			this.logger.debug('path get balance: ', urlGetBalance);
			const balanceInfo = await this.callApiFromDomain(url, urlGetBalance);
			if (balanceInfo?.data?.balance !== undefined) {
				return balanceInfo;
			} else {
				return null;
			}
		} catch (error) {
			this.logger.error('getBalance error', error);
		}
	}

	@Event({ name: 'CW20.validate' })
	private async _handleCW20Validate(ctx: Context<any>) {
		const codeId = ctx.params.codeId;
		const chainId = ctx.params.chainId;
		// Const contract_type = ctx.params.contract_type;
		const url = ctx.params.url;
		const cacheKey = `${VALIDATE_CODEID_PREFIX}_${chainId}_${codeId}`;

		this.logger.debug('ctx.params', codeId, chainId, CONTRACT_TYPE.CW20);

		const processingFlag = await this.broker.cacher?.get(cacheKey);
		if (!processingFlag) {
			await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
			// eslint-disable-next-line no-underscore-dangle
			this._checkIfContractImplementInterface(url, chainId, codeId);
			await this.broker.cacher?.del(cacheKey);
		}
	}

	@Event({ name: 'CW20.handle' })
	private async _handleCW20(ctx: Context<any>) {
		const chainId = ctx.params.chainId;
		const codeId = ctx.params.codeId;
		const url = ctx.params.url;
		const cacheKey = `${HANDLE_CODEID_PREFIX}_${chainId}_${codeId}`;

		const processingFlag = await this.broker.cacher?.get(cacheKey);
		if (!processingFlag) {
			await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);

			this.logger.debug('Asset handler registered', chainId, codeId);

			// eslint-disable-next-line no-underscore-dangle
			await this._handleJob(url, chainId, codeId);

			await this.broker.cacher?.del(cacheKey);
		}
	}

	private async _checkIfContractImplementInterface(url: string, chainId: string, codeId: number) {
		try {
			let cw20flag: any = null;
			const urlGetContractList = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
			let path = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
			let nextKey = null;
			do {
				const resultCallApi = await this.callApiFromDomain(url, path);
				if (resultCallApi?.contracts?.length > 0) {
					let i = 0;
					while (i < resultCallApi.contracts.length) {
						const address = resultCallApi.contracts[i];
						const urlGetTokenInfo = `${CONTRACT_URI}${address}/smart/${CW20_ACTION.URL_GET_TOKEN_INFO}`;
						const tokenInfo = await this.callApiFromDomain(url, urlGetTokenInfo);
						if (
							tokenInfo?.data?.name === undefined ||
							tokenInfo?.data?.symbol === undefined ||
							tokenInfo?.data?.decimals === undefined ||
							tokenInfo?.data?.total_supply === undefined
						) {
							cw20flag = false;
							break;
						}
						const urlGetListOwner = `${CONTRACT_URI}${address}/smart/${CW20_ACTION.URL_GET_OWNER_LIST}`;
						const listOwnerAddress = await this.callApiFromDomain(url, urlGetListOwner);
						if (listOwnerAddress?.data?.accounts !== undefined) {
							if (listOwnerAddress.data.accounts.length > 0) {
								const owner = listOwnerAddress.data.accounts[0];
								const str = `{"balance":{"address": "${owner}"}}`;
								const stringEncode64bytes = Buffer.from(str).toString('base64');
								const urlGetBalance = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
								const balanceInfo = await this.callApiFromDomain(
									url,
									urlGetBalance,
								);
								cw20flag = balanceInfo?.data?.balance !== undefined;
								break;
							}
						} else {
							cw20flag = false;
							break;
						}
						i++;
					}
					nextKey = resultCallApi.pagination.next_key;
					if (nextKey === null) {
						break;
					}
					path = `${urlGetContractList}pagination.key=${encodeURIComponent(nextKey)}`;
				} else {
					this.logger.warn('Call urlGetContractList unsatisfactory return', url, path);
				}
			} while (nextKey != null && cw20flag === null);
			this.logger.debug(
				'Check if cw20 interface implemented',
				cw20flag == null ? CodeIDStatus.TBD : cw20flag,
			);
			// eslint-disable-next-line camelcase
			const condition = { code_id: codeId, 'custom_info.chain_id': chainId };
			switch (cw20flag) {
				case null: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						update: { status: CodeIDStatus.TBD },
					});
					break;
				}
				case true: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						update: { status: CodeIDStatus.COMPLETED },
					});
					this.broker.emit('CW20.handle', { url, chainId, codeId });
					break;
				}
				case false: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						update: { status: CodeIDStatus.REJECTED },
					});
					break;
				}
			}
		} catch (err) {
			this.logger.error(err);
			await this.broker.cacher?.del(`${VALIDATE_CODEID_PREFIX}_${chainId}_${codeId}`);
		}
	}
	private async _handleJob(url: any, chainId: string, codeId: number) {
		try {
			const contractList: any = await this.broker.call(
				COMMON_ACTION.GET_CONTRACT_LIST,
				{ url, codeId },
				opts,
			);
			await Promise.all(
				contractList.map(async (address: string) => {
					this.createJob(
						'CW20.enrich',
						{
							url,
							address,
							codeId,
							typeEnrich: ENRICH_TYPE.UPSERT,
							chainId,
						},
						{
							removeOnComplete: true,
							removeOnFail: {
								count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
							},
							attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
							backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
						},
					);
				}),
			);
			this.logger.debug('Asset handler DONE!', contractList.length);
		} catch (err) {
			this.logger.error(err);
			await this.broker.cacher?.del(`${HANDLE_CODEID_PREFIX}_${chainId}_${codeId}`);
		}
	}

	public async handleJobEnrichData(
		url: any,
		address: string,
		codeId: string,
		typeEnrich: string,
		chainId: string,
	) {
		const urlGetTokenInfo = `${CONTRACT_URI}${address}/smart/${CW20_ACTION.URL_GET_TOKEN_INFO}`;
		const tokenInfo = await this.callApiFromDomain(url, urlGetTokenInfo);

		const listOwnerAddress: any = await this.broker.call(
			CW20_ACTION.GET_OWNER_LIST,
			{ url, codeId, address },
			opts,
		);
		this.logger.debug(`Cw20 listOwnerAddress ${JSON.stringify(listOwnerAddress)}`);
		if (listOwnerAddress != null) {
			await Promise.all(
				listOwnerAddress.map(async (owner: string) => {
					const balanceInfo: any = await this.broker.call(
						CW20_ACTION.GET_BALANCE,
						{ url, codeId, address, owner },
						opts,
					);
					if (balanceInfo != null) {
						const asset = Common.createCW20AssetObject(
							codeId,
							address,
							owner,
							tokenInfo,
							balanceInfo,
							chainId,
						);
						await this.broker.call(
							`v1.CW20-asset-manager.act-${typeEnrich}`,
							asset,
							opts,
						);
						this.logger.debug(`Asset ${JSON.stringify(asset)} created`);
					}
				}),
			);
		}

		try {
			await this.broker.call('v1.crawlDailyCw20Holder.update-contract-holders', {
				address,
			});
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start(): Promise<void> {
		this.getQueue('CW20.enrich').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW20.enrich').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW20.enrich').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
