/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAssetMixin } from '../../mixins/dbMixinMongoose';
import { Status } from '../../model/codeid.model';
import { Config } from '../../common';
import { contextParamsCloning, retryPolicy } from 'moleculer.config';
import { Types } from 'mongoose';
import { URL_TYPE_CONSTANTS, ASSET_INDEXER_ACTION } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { Common } from './common';
import { info } from 'console';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const URL = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

const callApiMixin = new CallApiMixin().start();


type TokenInfo = {
	code_id: Number;
	address: String;
	token_id: String;
};

type RetryTime = {
	retry_time: number;
};

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'assetHandleCodeID',
	version: 1,
	mixins: [callApiMixin, dbAssetMixin],
	events: {
		'code_id.validate': {
			handler(ctx: Context) {
				const code_id = ctx.params
				// @ts-ignore
				this.logger.debug('ctx.params.code_id', code_id);
				// @ts-ignore
				this.checkIfContractImplementCW721Interface(code_id);
			}
		},
		'code_id.handle': {
			async handler(ctx: Context) {
				const code_id = ctx.params
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(`codeid_${code_id}`);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(`codeid_${code_id}`, true);
					// @ts-ignore
					this.logger.debug('Asset handler registered', code_id);
					// @ts-ignore
					await this.handleJob(ctx, code_id);
					// @ts-ignore
					await this.broker.cacher?.del(`codeid_${code_id}`);
				}
				//TODO emit event index history of the NFT.
			},
			//TODO subcribe the event index the history of the NFT
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	async handleJob(ctx: Context, code_id: Number) {
		let contractList: any[] = [];
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			let resultCallApi = await this.callApiFromDomain(URL, path);
			if (resultCallApi?.contracts?.length > 0) {
				contractList.push(...resultCallApi.contracts);
				next_key = resultCallApi.pagination.next_key;
				if (next_key === null) {
					break;
				}
				path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
			} else {
				this.logger.error('Call urlGetContractList return error', path);
			}
		} while (next_key != null);
		const insertInforPromises = await Promise.all(
			contractList.map(async (address) => {
				// let address = contractList[4];
				// let retry_time = 0;
				let listTokenIDs: any = await ctx.call(
					ASSET_INDEXER_ACTION.ACTION_GET_TOKEN_LIST,
					{ code_id, address },
					{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
				);
				// let get_token_info_retry_time = 0;
				if (listTokenIDs != null) {
					const getInforPromises = await Promise.all(
						listTokenIDs.data.tokens.map(async (token_id: String) => {
							let tokenInfo: any = await ctx.call(
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
								await this.adapter.insert(asset);
							}
						}),
					);
					await getInforPromises;
				}
			})
		);
		await insertInforPromises;
		this.logger.debug('Asset handler DONE!', contractList.length);
	}
	async checkIfContractImplementCW721Interface(code_id: Number) {
		let cw721flag: any = null;
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			let resultCallApi = await this.callApiFromDomain(URL, path);
			if (resultCallApi?.contracts?.length > 0) {
				let i = 0;
				while (i < resultCallApi.contracts.length) {
					let address = resultCallApi.contracts[i];
					let urlGetListToken = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.GET_TOKEN_LIST}`;
					let listTokenIDs = await this.callApiFromDomain(URL, urlGetListToken);
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
				this.logger.error('Call urlGetContractList unsatisfactory return', path);
			}
		} while (next_key != null && cw721flag === null);
		this.logger.debug(
			'Check if cw721 interface implemented',
			cw721flag == null ? Status.TBD : cw721flag,
		);
		switch (cw721flag) {
			case null: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition: { code_id: code_id },
					update: { status: Status.TBD },
				});
				break;
			}
			case true: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition: { code_id: code_id },
					update: { status: Status.COMPLETED },
				});
				this.broker.emit('code_id.handle', code_id);
				break;
			}
			case false: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition: { code_id: code_id },
					update: { status: Status.REJECTED },
				});
				break;
			}
		}
	}

	@Action()
	private async getTokenList(ctx: Context<TokenInfo>) {
		let code_id = ctx.params.code_id;
		let address = ctx.params.address;
		try {
			let urlGetListToken = `${CONTRACT_URI}${ctx.params.address}/smart/${ASSET_INDEXER_ACTION.GET_TOKEN_LIST}`;

			let listTokenIDs = await this.callApiFromDomain(URL, urlGetListToken);
			if (listTokenIDs?.data?.tokens !== undefined && listTokenIDs.data.tokens.length > 0) {
				return listTokenIDs;
				// this.logger.info("Asset already inserted", listTokenIDs.data.tokens.length);
			} else return null
		} catch (error) {
			this.logger.error('getTokenList error', error);
		}
	}

	@Action()
	private async getTokenInfor(ctx: Context<TokenInfo, RetryTime>) {
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
}
