/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { CallingOptions, Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
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
} from '../../common/constant';
import { Common, TokenInfo } from './common.service';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { AddBurnedToAsset } from 'types';
const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const OPTs: CallingOptions = { timeout: 0, retries: MAX_RETRY_REQ };
const ASSET_INDEXER_TOKEN_ID_LIMIT = Config.ASSET_INDEXER_TOKEN_ID_LIMIT;
const VALIDATE_CODEID_PREFIX = 'validate_codeid';
const HANDLE_CODEID_PREFIX = 'handle_codeid';

const callApiMixin = new CallApiMixin().start();
import { QueueConfig } from '../../config/queue';
import { Job } from 'bull';
const QueueService = require('moleculer-bull');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721',
	version: 1,
	mixins: [callApiMixin, dbCW721AssetMixin, QueueService(QueueConfig.redis, QueueConfig.opts)],
	queues: {
		'CW721.enrich-tokenid': {
			concurrency: parseInt(Config.CONCURRENCY_ENRICH_TOKEN_ID, 10),
			async process(job: Job) {
				job.progress(10);
				const url = job.data.url;
				const address = job.data.address;
				const code_id = job.data.code_id;
				const chain_id = job.data.chain_id;
				const token_id = job.data.token_id;
				const typeEnrich = job.data.type_enrich;
				// @ts-ignore
				await this.handleJobEnrichTokenId(
					url,
					address,
					code_id,
					chain_id,
					token_id,
					typeEnrich,
				);
				job.progress(100);
			},
		},
	},
	events: {
		'CW721.validate': {
			async handler(ctx: Context<any>) {
				const code_id = ctx.params.code_id;
				const chain_id = ctx.params.chain_id;
				// const contract_type = ctx.params.contract_type;
				const URL = ctx.params.URL;
				const cacheKey = `${VALIDATE_CODEID_PREFIX}_${chain_id}_${code_id}`;
				// @ts-ignore
				this.logger.info('ctx.params', code_id, chain_id, CONTRACT_TYPE.CW721);

				// @ts-ignore
				await this.checkIfContractImplementInterface(URL, chain_id, code_id);
				// @ts-ignore
				// const processingFlag = await this.broker.cacher?.get(cacheKey);
				// if (!processingFlag) {
				// 	// @ts-ignore
				// 	await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
				// 	// @ts-ignore
				// 	await this.checkIfContractImplementInterface(URL, chain_id, code_id);
				// 	// @ts-ignore
				// 	await this.broker.cacher?.del(cacheKey);
				// }
			},
		},
		'CW721.handle': {
			async handler(ctx: Context<any>) {
				const chain_id = ctx.params.chain_id;
				const code_id = ctx.params.code_id;
				const URL = ctx.params.URL;
				const cacheKey = `${HANDLE_CODEID_PREFIX}_${chain_id}_${code_id}`;
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(cacheKey);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(cacheKey, true);
					// @ts-ignore
					this.logger.debug('Asset handler registered', chain_id, code_id);
					// @ts-ignore
					this.handleJob(URL, chain_id, code_id);
					// @ts-ignore
					await this.broker.cacher?.del(cacheKey);
					//TODO emit event index history of the NFT.
				}
				//TODO subcribe the event index the history of the NFT
			},
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	async checkIfContractImplementInterface(URL: string, chain_id: string, code_id: number) {
		try {
			let cw721flag: any = null;
			const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&`;
			let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&`;
			this.logger.debug('Call urlGetContractList', URL, urlGetContractList);
			let next_key = null;
			do {
				let resultCallApi = await this.callApiFromDomain(URL, path);
				this.logger.debug('Call resultCallApi', JSON.stringify(resultCallApi));
				if (resultCallApi?.contracts?.length > 0) {
					let i = 0;
					while (i < resultCallApi.contracts.length) {
						let address = resultCallApi.contracts[i];
						let urlGetListToken = `${CONTRACT_URI}${address}/smart/${CW721_ACTION.URL_GET_TOKEN_LIST}`;
						let listTokenIDs = await this.callApiFromDomain(URL, urlGetListToken);
						this.logger.debug('Call urlGetListToken', urlGetListToken);
						this.logger.debug('Call listTokenIDs', JSON.stringify(listTokenIDs));
						if (listTokenIDs?.data?.tokens !== undefined) {
							if (listTokenIDs.data.tokens.length > 0) {
								const id = listTokenIDs.data.tokens[0];
								const str = `{"all_nft_info":{"token_id":"${id}"}}`;
								const stringEncode64bytes = Buffer.from(str).toString('base64');
								let urlGetOwner = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
								let tokenInfo = await this.callApiFromDomain(URL, urlGetOwner);
								cw721flag = tokenInfo?.data?.access?.owner !== undefined;
								break;
							}
						} else {
							cw721flag = false;
							break;
						}
						i++;
					}
					next_key = resultCallApi.pagination.next_key;
					if (next_key === null) {
						break;
					}
					path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
				} else {
					this.logger.warn('Call urlGetContractList unsatisfactory return', URL, path);
				}
			} while (next_key != null && cw721flag === null);
			this.logger.debug(
				'Check if cw721 interface implemented',
				cw721flag == null ? CodeIDStatus.TBD : cw721flag,
			);
			const condition = { code_id: code_id, 'custom_info.chain_id': chain_id };
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
					this.broker.emit('CW721.handle', { URL, chain_id, code_id });
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
			await this.broker.cacher?.del(`${VALIDATE_CODEID_PREFIX}_${chain_id}_${code_id}`);
		}
	}
	async handleJob(URL: string, chain_id: string, code_id: Number) {
		try {
			const contractList: any = await this.broker.call(
				COMMON_ACTION.GET_CONTRACT_LIST,
				{ URL, code_id },
				OPTs,
			);

			contractList.map((address: String) => {
				this.broker.call(
					CW721_ACTION.ENRICH_DATA,
					[{ URL, chain_id, code_id, address }, ENRICH_TYPE.INSERT],
					OPTs,
				);
			});
			// await insertInforPromises;
			this.logger.debug('Asset handler DONE!', contractList.length);
		} catch (err) {
			this.logger.error(err);
			await this.broker.cacher?.del(`${HANDLE_CODEID_PREFIX}_${chain_id}_${code_id}`);
		}
	}

	async handleJobEnrichTokenId(
		url: any,
		address: string,
		code_id: number,
		chain_id: string,
		token_id: string,
		type_enrich: string,
	) {
		let tokenInfo: any = await this.broker.call(
			CW721_ACTION.GET_TOKEN_INFOR,
			{ URL: url, code_id, address, token_id },
			OPTs,
		);
		if (tokenInfo != null) {
			let [uri, type, file_name, media_link_key] = ['', '', '', ''];

			let imageLink = null;
			let metadata = null;
			if (tokenInfo.data.info.extension) {
				metadata = tokenInfo.data.info.extension;
				if (tokenInfo.data.info.extension.image) {
					imageLink = tokenInfo.data.info.extension.image;
				}
			}

			try {
				// if has token uri
				if (tokenInfo.data.info.token_uri) {
					[uri, type, file_name, media_link_key] = Common.getKeyFromUri(
						tokenInfo.data.info.token_uri,
					);
					let schemaIPFS: Buffer = await Common.downloadAttachment(uri);
					// let schemaType = await Common.getFileTypeFromBuffer(schemaIPFS);

					if (schemaIPFS) {
						metadata = JSON.parse(schemaIPFS.toString());
					}
					if (!imageLink) {
						imageLink = metadata.image;
					}
				}
				if (!imageLink && tokenInfo.data.info.token_uri) {
					imageLink = tokenInfo.data.info.token_uri;
				}
			} catch (error) {
				this.logger.error('Cannot get schema');
				// this.logger.error(error);
			}

			try {
				if (imageLink) {
					[uri, type, file_name, media_link_key] = Common.getKeyFromUri(imageLink);
					this.broker.emit('CW721-media.get-media-link', {
						uri,
						type,
						file_name,
						media_link_key,
						chain_id,
						metadata,
					});
				}
			} catch (error) {
				this.logger.error('Cannot get media link');
				this.logger.error(error);
			}

			const asset = Common.createCW721AssetObject(
				code_id,
				address,
				token_id,
				media_link_key,
				tokenInfo,
				chain_id,
			);
			this.logger.debug('insert new asset: ', JSON.stringify(asset));
			this.broker.call(`v1.CW721-asset-manager.act-${type_enrich}`, asset, OPTs);
		}
	}

	@Action()
	private async enrichData(ctx: Context<[TokenInfo, string]>) {
		const URL = ctx.params[0].URL;
		const address = ctx.params[0].address;
		const code_id = ctx.params[0].code_id;
		const typeEnrich = ctx.params[1];
		const chain_id = ctx.params[0].chain_id;
		let listTokenIDs: any = await this.broker.call(
			CW721_ACTION.GET_TOKEN_LIST,
			{ URL, code_id, address },
			OPTs,
		);
		// let listTokenIDs = await this.actions.getTokenList({ URL, code_id, address }, OPTs);

		if (listTokenIDs != null) {
			listTokenIDs.map((token_id: String) => {
				this.createJob(
					'CW721.enrich-tokenid',
					{
						url: URL,
						address: address,
						code_id: code_id,
						type_enrich: typeEnrich,
						chain_id: chain_id,
						token_id: token_id,
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 3,
						},
					},
				);
			});
			// const getInforPromises = await Promise.all(
			// 	listTokenIDs.map(async (token_id: String) => {
			// 		this.createJob(
			// 			'CW721.enrich-tokenid',
			// 			{
			// 				url: URL,
			// 				address: address,
			// 				code_id: code_id,
			// 				type_enrich: typeEnrich,
			// 				chain_id: chain_id,
			// 				token_id: token_id,
			// 			},
			// 			{
			// 				removeOnComplete: true,
			// 				removeOnFail: {
			// 					count: 3,
			// 				},
			// 			},
			// 		);
			// 	}),
			// );
			// await getInforPromises;
		}
	}

	@Action()
	private async getTokenList(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		const address = ctx.params.address;
		try {
			let doneLoop = false;
			let listTokenId = [];
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${toBase64(
				toUtf8(`{"all_tokens":{"limit":${ASSET_INDEXER_TOKEN_ID_LIMIT}}}`),
			)}`;
			while (!doneLoop) {
				let resultCallApi = await this.callApiFromDomain(URL, urlGetListToken);
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

	@Action()
	private async getTokenInfor(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		try {
			const str = `{"all_nft_info":{"token_id":"${ctx.params.token_id}"}}`;
			const stringEncode64bytes = Buffer.from(str).toString('base64');
			let urlGetOwner = `${CONTRACT_URI}${ctx.params.address}/smart/${stringEncode64bytes}`;
			let tokenInfo = await this.callApiFromDomain(URL, urlGetOwner);
			if (tokenInfo?.data?.access?.owner !== undefined) {
				return tokenInfo;
			} else return null;
		} catch (error) {
			this.logger.error('getTokenInfor error', error);
		}
	}
	@Action()
	private async addBurnedToAsset(ctx: Context<AddBurnedToAsset>) {
		const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const asset = await this.adapter.findOne({
			'custom_info.chain_id': ctx.params.chainid,
			contract_address: ctx.params.contractAddress,
			token_id: ctx.params.tokenId,
		});
		if (asset) {
			await this.adapter.updateById(asset._id, {
				$set: {
					is_burned: true,
				},
			});
		}
	}

	@Action()
	private async updateById(id: any, update: any) {
		return await this.adapter.updateById(id, update);
	}

	_start(): Promise<void> {
		this.getQueue('CW721.enrich-tokenid').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW721.enrich-tokenid').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW721.enrich-tokenid').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
