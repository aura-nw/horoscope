/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import moleculer, { CallingOptions, Context } from 'moleculer';
import { Action, Event, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { AddBurnedToAsset } from 'types';
import { Job } from 'bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { CodeIDStatus } from '../../model/codeid.model';
import { Config } from '../../common';
import {
	CODEID_MANAGER_ACTION,
	COMMON_ACTION,
	CW721_ACTION,
	ENRICH_TYPE,
	CONTRACT_TYPE,
	LIST_NETWORK,
	CW721_FIELD,
} from '../../common/constant';
import { queueConfig } from '../../config/queue';
import { Common, ITokenInfo } from './common.service';
const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
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
	name: 'CW721',
	version: 1,
	mixins: [
		new CallApiMixin().start(),
		dbCW721AssetMixin,
		queueService(queueConfig.redis, queueConfig.opts),
	],
	queues: {
		'CW721.enrich-tokenid': {
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
		'CW721.migrate-old-data': {
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
	@Event({ name: 'CW721.validate' })
	async cw721Validate(ctx: Context<any>) {
		const codeId = ctx.params.codeId;
		const chainId = ctx.params.chainId;
		const url = ctx.params.url;
		this.logger.info('ctx.params', codeId, chainId, CONTRACT_TYPE.CW721);
		await this.checkIfContractImplementInterface(url, chainId, codeId);
	}

	@Event({ name: 'CW721.handle' })
	async cw721Handle(ctx: Context<any>) {
		const chainId = ctx.params.chainId;
		const codeId = ctx.params.codeId;
		const url = ctx.params.url;
		const cacheKey = `${HANDLE_CODEID_PREFIX}_${chainId}_${codeId}`;
		// @ts-ignore
		const processingFlag = await this.broker.cacher?.get(cacheKey);
		if (!processingFlag) {
			await this.broker.cacher?.set(cacheKey, true);
			this.logger.debug('Asset handler registered', chainId, codeId);
			this.handleJob(url, chainId, codeId);
			await this.broker.cacher?.del(cacheKey);
		}
	}
	async checkIfContractImplementInterface(url: string, chainId: string, codeId: number) {
		try {
			let cw721flag: any = null;
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
						const urlGetListToken = `${CONTRACT_URI}${address}/smart/${CW721_ACTION.URL_GET_TOKEN_LIST}`;
						const listTokenIDs = await this.callApiFromDomain(url, urlGetListToken);
						this.logger.debug('Call urlGetListToken', urlGetListToken);
						this.logger.debug('Call listTokenIDs', JSON.stringify(listTokenIDs));
						if (listTokenIDs?.data?.tokens !== undefined) {
							if (listTokenIDs.data.tokens.length > 0) {
								const id = listTokenIDs.data.tokens[0];
								const str = `{"all_nft_info":{"tokenId":"${id}"}}`;
								const stringEncode64bytes = Buffer.from(str).toString('base64');
								const urlGetOwner = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
								const tokenInfo = await this.callApiFromDomain(url, urlGetOwner);
								cw721flag = tokenInfo?.data?.access?.owner !== undefined;
								break;
							}
						} else {
							cw721flag = false;
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
			} while (nextKey != null && cw721flag === null);
			this.logger.debug(
				'Check if cw721 interface implemented',
				cw721flag == null ? CodeIDStatus.TBD : cw721flag,
			);
			// eslint-disable-next-line quote-props
			const condition = { codeId, 'custom_info.chain_id': chainId };
			switch (cw721flag) {
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
					this.broker.emit('CW721.handle', { url, chainId, codeId });
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
	async handleJob(url: string, chainId: string, codeId: number) {
		try {
			const contractList: any = await this.broker.call(
				COMMON_ACTION.GET_CONTRACT_LIST,
				{ url, codeId },
				opts,
			);

			contractList.map((address: string) => {
				this.broker.call(
					CW721_ACTION.ENRICH_DATA,
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
			CW721_ACTION.GET_TOKEN_INFOR,
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

			// Create a record to save cw721
			const asset = Common.createCW721AssetObject(
				codeId,
				address,
				tokenId,
				mediaLinkKey,
				tokenInfo,
				chainId,
				metadata,
			);

			const resultInsert: any = await this.broker.call(
				`v1.CW721-asset-manager.act-${typeEnrich}`,
				asset,
			);
			this.logger.debug('insert new asset: ', JSON.stringify(resultInsert));
			// Const assetId = resultInsert._id.toString();
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
						cw721Id: resultInsert,
					};
					this.logger.debug('param emit get-media-link: ', JSON.stringify(paramEmit));
					this.broker.emit('CW721-media.get-media-link', paramEmit);
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
						cw721Id: resultInsert,
					};
					this.logger.debug('param emit get-media-link: ', JSON.stringify(paramEmit));
					this.broker.emit('CW721-media.get-media-link', paramEmit);
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
			CW721_ACTION.GET_TOKEN_LIST,
			{ url, codeId, address },
			opts,
		);

		if (listTokenIDs != null) {
			listTokenIDs.map((tokenId: string) => {
				this.createJob(
					'CW721.enrich-tokenid',
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
							count: 3,
						},
						attempts: 5,
						backoff: 5000,
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
			this.logger.error('getTokenInfor error', error);
		}
	}
	@Action({ name: 'addBurnedToAsset' })
	private async _addBurnedToAsset(ctx: Context<AddBurnedToAsset>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		/* eslint-disable quote-props */
		/* eslint-disable camelcase */
		const asset = await this.adapter.findOne({
			'custom_info.chain_id': ctx.params.chainid,
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
		/* eslint-enable quote-props  */
		/* eslint-enable camelcase */
	}

	@Action({ name: 'updateById' })
	private async _updateById(id: any, update: any) {
		return await this.adapter.updateById(id, update);
	}
	async handleMigrateOldData(chainId: string) {
		const listAggregate: any[] = [];
		const network = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}

		listAggregate.push(
			{
				$match: {
					// eslint-disable-next-line camelcase
					media_link: { $ne: '' },
				},
			},
			{
				$lookup: {
					from: 'cw721_media_link',
					localField: 'media_link',
					foreignField: 'key',
					as: 'media_info',
				},
			},
			{
				$limit: 10,
			},
		);

		// @ts-ignore
		this.logger.debug(JSON.stringify(listAggregate));
		// @ts-ignore
		const listResult = await this.adapter.aggregate(listAggregate);
		let listBulk: any[] = [];
		listResult.forEach(async (result: any) => {
			if (result.media_info && result.media_info.length > 0) {
				const link = result.media_info[0].media_link;
				const contentType = result.media_info[0].content_type;

				const image: any = {};
				if (link) {
					// eslint-disable-next-line camelcase
					image.link_s3 = link;
				}
				if (contentType) {
					// eslint-disable-next-line camelcase
					image.content_type = contentType;
				}

				listBulk.push({
					updateOne: {
						filter: {
							// eslint-disable-next-line camelcase, no-underscore-dangle
							_id: result._id,
						},
						update: {
							$set: {
								image,
							},
						},
					},
				});
			}
		});

		if (listBulk.length > 0) {
			// @ts-ignore
			const resultBulk = await this.adapter.bulkWrite(listBulk);
			this.logger.info(resultBulk);
			listBulk = [];
		}
	}
	public async _start(): Promise<void> {
		// @ts-ignore
		// This.createJob(
		// 	'CW721.migrate-old-data',
		// 	{
		// 		Chain_id: 'euphoria-1',
		// 	},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 		// attempts: 5,
		// 		// backoff: 5000,
		// 	},
		// );
		// Const URL = Utils.getUrlByChainIdAndType('aura-testnet-2', URL_TYPE_CONSTANTS.LCD);
		// This.createJob(
		// 	'CW721.enrich-tokenid',
		// 	{
		// 		Url: URL,
		// 		Address: 'aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re',
		// 		Code_id: '259',
		// 		Type_enrich: 'upsert',
		// 		Chain_id: 'aura-testnet-2',
		// 		Token_id: 'token 23',
		// 	},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 	},
		// );
		// This.createJob(
		// 	'CW721.enrich-tokenid',
		// 	{
		// 		Url: URL,
		// 		Address: 'aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re',
		// 		Code_id: '259',
		// 		Type_enrich: 'upsert',
		// 		Chain_id: 'aura-testnet-2',
		// 		Token_id: 'token 24',
		// 	},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 	},
		// );
		// Let listUri = [
		// 	'',
		// ];
		// ListUri.map(async (uri) => {
		// 	Let schemaIPFS: Buffer = await Common.downloadAttachment(uri);
		// 	Let schemaType = await Common.getFileTypeFromBuffer(schemaIPFS);
		// 	This.logger.info(uri, ' ', schemaType);
		// });

		this.getQueue('CW721.enrich-tokenid').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW721.enrich-tokenid').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW721.enrich-tokenid').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		// eslint-disable-next-line no-underscore-dangle
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
