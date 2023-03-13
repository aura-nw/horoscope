/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import moleculer, { CallingOptions, Context } from 'moleculer';
import { Action, Event, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { AddBurnedToAsset } from 'types';
import { Job } from 'bull';
import { Types } from 'mongoose';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbCW4973AssetMixin } from '../../mixins/dbMixinMongoose';
import { CodeIDStatus } from '../../model/codeid.model';
import { Config } from '../../common';
import {
	CODEID_MANAGER_ACTION,
	COMMON_ACTION,
	ENRICH_TYPE,
	CONTRACT_TYPE,
	LIST_NETWORK,
	CW721_FIELD,
	CW4973_ACTION,
} from '../../common/constant';
import { queueConfig } from '../../config/queue';
import { Common, ITokenInfo } from './common.service';
const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const opts: CallingOptions = { timeout: 0, retries: MAX_RETRY_REQ };
const ASSET_INDEXER_TOKEN_ID_LIMIT = Config.ASSET_INDEXER_TOKEN_ID_LIMIT;
const VALIDATE_CODEID_PREFIX = 'validate_codeid';
const HANDLE_CODEID_PREFIX = 'handle_codeid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW4973',
	version: 1,
	mixins: [
		new CallApiMixin().start(),
		dbCW4973AssetMixin,
		queueService(queueConfig.redis, queueConfig.opts),
	],
	queues: {
		'CW4973.enrich-tokenid': {
			concurrency: parseInt(Config.CONCURRENCY_ENRICH_TOKEN_ID, 10),
			async process(job: Job) {
				job.progress(10);
				const url = job.data.url;
				const address = job.data.address;
				const codeId = job.data.codeId;
				const chainId = job.data.chainId;
				const tokenId = job.data.tokenId;
				const typeEnrich = job.data.typeEnrich;
				// @ts-ignore
				await this.handleJobEnrichTokenId(
					url,
					address,
					codeId,
					chainId,
					tokenId,
					typeEnrich,
				);
				job.progress(100);
			},
		},
		'CW4973.migrate-old-data': {
			concurrency: 1,
			async process(job: Job) {
				const chainId = job.data.chainId;
				// @ts-ignore
				this.handleMigrateOldData(chainId);
			},
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	@Event({ name: 'CW4973.validate' })
	async cw4973Validate(ctx: Context<any>) {
		const codeId = ctx.params.codeId;
		const chainId = ctx.params.chainId;
		const url = ctx.params.url;
		this.logger.info('ctx.params', codeId, chainId, CONTRACT_TYPE.CW4973);
		await this.checkIfContractImplementInterface(url, chainId, codeId);
	}

	@Event({ name: 'CW4973.handle' })
	async cw4973Handle(ctx: Context<any>) {
		const chainId = ctx.params.chainId;
		const codeId = ctx.params.codeId;
		const url = ctx.params.url;
		const cacheKey = `${HANDLE_CODEID_PREFIX}_${chainId}_${codeId}`;
		// @ts-ignore
		const processingFlag = await this.broker.cacher?.get(cacheKey);
		if (!processingFlag) {
			await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
			this.logger.debug('Asset handler registered', chainId, codeId);
			this.handleJob(url, chainId, codeId);
			await this.broker.cacher?.del(cacheKey);
		}
	}

	async checkIfContractImplementInterface(url: any, chainId: string, codeId: number) {
		try {
			let cw4973flag: any = null;
			const urlGetContractList = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&`;
			let path = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&`;
			this.logger.debug('Call urlGetContractList', url, urlGetContractList);
			let nextKey = null;
			do {
				const resultCallApi = await this.callApiFromDomain(url, path);
				this.logger.debug('Call resultCallApi', JSON.stringify(resultCallApi));
				if (resultCallApi?.contracts?.length > 0) {
					let i = 0;
					while (i < resultCallApi.contracts.length) {
						const address = resultCallApi.contracts[i];
						const urlGetListToken = `${CONTRACT_URI}${address}/smart/${CW4973_ACTION.URL_GET_TOKEN_LIST}`;
						const listTokenIDs = await this.callApiFromDomain(url, urlGetListToken);
						this.logger.debug('Call urlGetListToken', urlGetListToken);
						this.logger.debug('Call listTokenIDs', JSON.stringify(listTokenIDs));
						if (listTokenIDs?.data?.tokens !== undefined) {
							if (listTokenIDs.data.tokens.length > 0) {
								const id = listTokenIDs.data.tokens[0];
								const str = `{"all_nft_info":{"token_id":"${id}"}}`;
								const stringEncode64bytes = Buffer.from(str).toString('base64');
								const urlGetOwner = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
								const tokenInfo = await this.callApiFromDomain(url, urlGetOwner);
								cw4973flag = tokenInfo?.data?.access?.owner !== undefined;
								break;
							}
						} else {
							cw4973flag = false;
							break;
						}
						i++;
					}
					nextKey = resultCallApi.pagination.nextKey;
					if (nextKey === null) {
						break;
					}
					path = `${urlGetContractList}pagination.key=${encodeURIComponent(nextKey)}`;
				} else {
					this.logger.warn('Call urlGetContractList unsatisfactory return', url, path);
				}
			} while (nextKey != null && cw4973flag === null);
			this.logger.debug(
				'Check if CW4973 interface implemented',
				cw4973flag == null ? CodeIDStatus.TBD : cw4973flag,
			);
			// eslint-disable-next-line camelcase
			const condition = { code_id: codeId, 'custom_info.chain_id': chainId };
			switch (cw4973flag) {
				case null: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						// eslint-disable-next-line camelcase
						update: { contract_type: CONTRACT_TYPE.CW4973, status: CodeIDStatus.TBD },
					});
					break;
				}
				case true: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						update: {
							// eslint-disable-next-line camelcase
							contract_type: CONTRACT_TYPE.CW4973,
							status: CodeIDStatus.COMPLETED,
						},
					});
					this.broker.emit('CW4973.handle', { url, chainId, codeId });
					break;
				}
				case false: {
					this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
						condition,
						update: {
							// eslint-disable-next-line camelcase
							contract_type: CONTRACT_TYPE.CW4973,
							status: CodeIDStatus.REJECTED,
						},
					});
					break;
				}
			}
		} catch (err) {
			this.logger.error(err);
			await this.broker.cacher?.del(`${VALIDATE_CODEID_PREFIX}_${chainId}_${codeId}`);
		}
	}
	async handleJob(url: string, chainId: string, codeId: number) {
		try {
			const contractList: any = await this.broker.call(
				COMMON_ACTION.GET_CONTRACT_LIST,
				{ url, codeId },
				opts,
			);
			// Const contractList: any = await this.getContractListByCodeID();

			contractList.map((address: string) => {
				this.broker.call(
					CW4973_ACTION.ENRICH_DATA,
					[{ url, chainId, codeId, address }, ENRICH_TYPE.INSERT],
					opts,
				);
			});
			// Await insertInforPromises;
			this.logger.debug('Asset handler DONE!', contractList.length);
		} catch (err) {
			this.logger.error(err);
			await this.broker.cacher?.del(`${HANDLE_CODEID_PREFIX}_${chainId}_${codeId}`);
		}
	}

	async handleJobEnrichTokenId(
		url: any,
		address: string,
		codeId: number,
		chainId: string,
		tokenId: string,
		typeEnrich: string,
	) {
		const tokenInfo: any = await this.broker.call(
			CW4973_ACTION.GET_TOKEN_INFOR,
			{ url, codeId, address, tokenId },
			opts,
		);
		if (tokenInfo != null) {
			let [uri, type, fileName, mediaLinkKey] = ['', '', '', ''];

			let imageLink = null;
			let metadata = null;
			let animationLink = null;
			if (tokenInfo.data.info.extension) {
				metadata = tokenInfo.data.info.extension;
				if (tokenInfo.data.info.extension.image) {
					imageLink = tokenInfo.data.info.extension.image;
				}
				if (tokenInfo.data.info.extension.animation_url) {
					animationLink = tokenInfo.data.info.extension.animation_url;
				}
			}

			try {
				// If has token uri, download and validate schema
				if (tokenInfo.data.info.token_uri) {
					[uri, type, fileName, mediaLinkKey] = Common.getKeyFromUri(
						tokenInfo.data.info.token_uri,
					);
					const schemaIPFS: Buffer = await Common.downloadAttachment(uri);
					// Let schemaType = await Common.getFileTypeFromBuffer(schemaIPFS);

					if (schemaIPFS) {
						metadata = JSON.parse(schemaIPFS.toString());
					}
					if (!imageLink && metadata.image) {
						imageLink = metadata.image;
					}
					if (!animationLink && metadata.animation_url) {
						animationLink = metadata.animation_url;
					}
				}
			} catch (error) {
				this.logger.error('Cannot get schema');
				if (!imageLink && tokenInfo.data.info.token_uri) {
					imageLink = tokenInfo.data.info.token_uri;
				}
			}

			// Create a record to save CW4973
			const asset = Common.createCW4973AssetObject(
				codeId.toString(),
				address,
				tokenId,
				mediaLinkKey,
				tokenInfo,
				chainId,
				metadata,
			);

			const resultInsert: any = await this.broker.call(
				`v1.CW4973-asset-manager.act-${typeEnrich}`,
				asset,
			);
			this.logger.debug('insert new asset: ', JSON.stringify(resultInsert));
			// eslint-disable-next-line no-underscore-dangle
			const cw4973Id = resultInsert._id ?? resultInsert;
			try {
				if (animationLink) {
					[uri, type, fileName, mediaLinkKey] = Common.getKeyFromUri(animationLink);
					const paramEmit = {
						sourceUri: animationLink,
						uri,
						type,
						fileName,
						mediaLinkKey,
						chainId,
						field: CW721_FIELD.ANIMATION,
						cw4973Id,
					};
					this.logger.debug('param emit get-media-link: ', JSON.stringify(paramEmit));
					this.broker.emit('CW4973-media.get-media-link', paramEmit);
				}
				if (imageLink) {
					[uri, type, fileName, mediaLinkKey] = Common.getKeyFromUri(imageLink);
					const paramEmit = {
						sourceUri: imageLink,
						uri,
						type,
						fileName,
						mediaLinkKey,
						chainId,
						field: CW721_FIELD.IMAGE,
						cw4973Id,
					};
					this.logger.debug('param emit get-media-link: ', JSON.stringify(paramEmit));
					this.broker.emit('CW4973-media.get-media-link', paramEmit);
				}
			} catch (error) {
				this.logger.error('Cannot get media link');
				this.logger.error(error);
			}
		}
	}

	@Action({ name: 'enrichData' })
	private async _enrichData(ctx: Context<[ITokenInfo, string]>) {
		const url = ctx.params[0].url;
		const address = ctx.params[0].address;
		const codeId = ctx.params[0].codeId;
		const typeEnrich = ctx.params[1];
		const chainId = ctx.params[0].chainId;
		const listTokenIDs: any = await this.broker.call(
			CW4973_ACTION.GET_TOKEN_LIST,
			{ url, codeId, address },
			opts,
		);

		if (listTokenIDs != null) {
			listTokenIDs.map((tokenId: string) => {
				this.createJob(
					'CW4973.enrich-tokenid',
					{
						url,
						address,
						codeId,
						typeEnrich,
						chainId,
						tokenId,
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
			});
		}
	}

	@Action({ name: 'getTokenList' })
	private async _getTokenList(ctx: Context<ITokenInfo>) {
		const url = ctx.params.url;
		const address = ctx.params.address;
		try {
			let doneLoop = false;
			const listTokenId = [];
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${toBase64(
				toUtf8(`{"all_tokens":{"limit":${ASSET_INDEXER_TOKEN_ID_LIMIT}}}`),
			)}`;
			while (!doneLoop) {
				const resultCallApi = await this.callApiFromDomain(url, urlGetListToken);
				this.logger.debug('Call urlGetListToken', urlGetListToken);
				this.logger.debug('Call listTokenIDs', JSON.stringify(resultCallApi));
				if (resultCallApi?.data?.tokens && resultCallApi.data.tokens.length > 0) {
					listTokenId.push(...resultCallApi.data.tokens);
					const lastTokenId =
						resultCallApi.data.tokens[resultCallApi.data.tokens.length - 1];
					urlGetListToken = `${CONTRACT_URI}${address}/smart/${toBase64(
						toUtf8(
							`{"all_tokens":{"limit":${ASSET_INDEXER_TOKEN_ID_LIMIT}, "start_after":"${lastTokenId}"}}`,
						),
					)}`;
				} else {
					doneLoop = true;
				}
			}
			if (listTokenId.length > 0) {
				return listTokenId;
			}
		} catch (error) {
			this.logger.error('getTokenList error', error);
		}
		return null;
	}

	@Action({ name: 'getTokenInfor' })
	private async _getTokenInfor(ctx: Context<ITokenInfo>) {
		const url = ctx.params.url;
		try {
			const str = `{"all_nft_info":{"token_id":"${ctx.params.tokenId}"}}`;
			const stringEncode64bytes = Common.updateBase64InUrl(toBase64(toUtf8(str)));
			const urlGetOwner = `${CONTRACT_URI}${ctx.params.address}/smart/${encodeURIComponent(
				stringEncode64bytes,
			)}`;
			const tokenInfo = await this.callApiFromDomain(url, urlGetOwner);
			if (tokenInfo?.data?.access?.owner !== undefined) {
				return tokenInfo;
			} else {
				return null;
			}
		} catch (error) {
			this.logger.error('getITokenInfor error', error);
		}
	}
	@Action({ name: 'addBurnedToAsset' })
	private async _addBurnedToAsset(ctx: Context<AddBurnedToAsset>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const asset = await this.adapter.findOne({
			'custom_info.chain_id': ctx.params.chainid,
			/* eslint-disable camelcase */
			contract_address: ctx.params.contractAddress,
			token_id: ctx.params.tokenId,
		});
		if (asset) {
			// eslint-disable-next-line no-underscore-dangle
			await this.adapter.updateById(asset._id, {
				$set: {
					is_burned: true,
				},
			});
		}
	}

	@Action({ name: 'updateById' })
	private async _updateById(id: any, update: any) {
		return await this.adapter.updateById(id, update);
	}

	async _start(): Promise<void> {
		this.getQueue('CW4973.enrich-tokenid').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW4973.enrich-tokenid').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW4973.enrich-tokenid').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
