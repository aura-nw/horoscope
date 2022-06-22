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
import { URL_TYPE_CONSTANTS } from '../../common/constant';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
// const EVENT_CODEID_VALIDATE = "code_id.validate";
// const EVENT_CODEID_HANDLE = "code_id.handle";
const GET_TOKEN_LIST = 'eyJhbGxfdG9rZW5zIjp7fX0=';
const ACTION_GET_TOKEN_INFOR = 'v1.asset.getTokenInfor';
const ACTION_GET_TOKEN_LIST = 'v1.asset.getTokenList';

const callApiMixin = new CallApiMixin().start();

type AssetInfo = {
	data: {
		access: {
			owner: String;
		};
	};
};

type TokenInfo = {
	code_id: Number;
	address: String;
	token_id: String;
};

type RetryTime = {
	retry_time: number;
};

@Service({
	name: 'asset',
	version: 1,
	mixins: [callApiMixin, dbAssetMixin],
	events: {
		'code_id.validate': {
			handler(ctx: Context) {
				// @ts-ignore
				this.logger.debug('ctx.params.code_id', ctx.params);
				// @ts-ignore
				this.checkIfContractImplementCW721Interface(ctx.params);
			},
		},
		'code_id.handle': {
			handler(ctx: Context) {
				// @ts-ignore
				this.logger.info('Asset handler registered', ctx.params);
				// @ts-ignore
				this.handleJob(ctx, ctx.params);
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
		let urlToCall = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			let resultCallApi = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlToCall);
			if (resultCallApi?.contracts?.length > 0) {
				contractList.push(...resultCallApi.contracts);
				next_key = resultCallApi.pagination.next_key;
				if (next_key === null) {
					break;
				}
				urlToCall = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
			} else {
				this.logger.error('Call urlGetContractList return error', urlToCall);
			}
		} while (next_key != null);

		const getInforPromises = await Promise.all(
			contractList.map(async (address) => {
				// let address = contractList[4];
				// let retry_time = 0;
				await ctx.call(
					ACTION_GET_TOKEN_LIST,
					{ code_id, address },
					{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
				);
				// await ctx.call(ACTION_GET_TOKEN_LIST, { code_id, address }, { timeout: ACTION_TIMEOUT, meta: { retry_time } });
			}),
		);
		await getInforPromises;
		this.logger.debug('Asset handler DONE!');
	}
	async checkIfContractImplementCW721Interface(code_id: Number) {
		let cw721flag: any = null;
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let urlToCall = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			let resultCallApi = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlToCall);
			if (resultCallApi?.contracts?.length > 0) {
				let i = 0;
				while (i < resultCallApi.contracts.length) {
					let address = resultCallApi.contracts[i];
					let urlGetListToken = `${CONTRACT_URI}${address}/smart/${GET_TOKEN_LIST}`;
					let listTokenIDs = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlGetListToken);
					if (listTokenIDs?.data?.tokens !== undefined) {
						if (listTokenIDs.data.tokens.length > 0) {
							const id = listTokenIDs.data.tokens[0];
							const str = `{"all_nft_info":{"token_id":"${id}"}}`;
							const stringEncode64bytes = Buffer.from(str).toString('base64');
							let urlGetOwner = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
							let tokenInfo = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlGetOwner);
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
				urlToCall = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
			} else {
				this.logger.error('Call urlGetContractList unsatisfactory return', urlToCall);
			}
		} while (next_key != null && cw721flag === null);
		this.logger.debug(
			'Check if cw721 interface implemented',
			cw721flag == null ? Status.TBD : cw721flag,
		);
		switch (cw721flag) {
			case null: {
				this.broker.call('code_id.updateMany', {
					condition: { code_id: code_id },
					update: { status: Status.TBD },
				});
				break;
			}
			case true: {
				this.broker.call('code_id.updateMany', {
					condition: { code_id: code_id },
					update: { status: Status.COMPLETED },
				});
				this.broker.emit('code_id.handle', code_id);
				break;
			}
			case false: {
				this.broker.call('code_id.updateMany', {
					condition: { code_id: code_id },
					update: { status: Status.REJECTED },
				});
				break;
			}
		}
	}

	@Action()
	private async getTokenList(ctx: Context<TokenInfo, RetryTime>) {
		// let get_token_list_retry_time = ctx.meta.retry_time + 1;
		let code_id = ctx.params.code_id;
		let address = ctx.params.address;
		try {
			let urlGetListToken = `${CONTRACT_URI}${ctx.params.address}/smart/${GET_TOKEN_LIST}`;
			let listTokenIDs = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlGetListToken);
			if (listTokenIDs?.data?.tokens !== undefined && listTokenIDs.data.tokens.length > 0) {
				let get_token_info_retry_time = 0;
				const getInforPromises = await Promise.all(
					listTokenIDs.data.tokens.map(async (token_id: String) => {
						// await ctx.call(ACTION_GET_TOKEN_INFOR, { code_id, address, token_id }, { timeout: ACTION_TIMEOUT, meta: { retry_time: get_token_info_retry_time } });
						await ctx.call(
							ACTION_GET_TOKEN_INFOR,
							{ code_id, address, token_id },
							{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
						);
					}),
				);
				await getInforPromises;
				// this.logger.info("Asset already inserted", listTokenIDs.data.tokens.length);
			}
		} catch (error) {
			this.logger.error('getTokenList error', error);
			// 	if (MAX_RETRY_REQ <= get_token_list_retry_time) {
			// 		// await ctx.call(ACTION_GET_TOKEN_LIST, { code_id, address }, { timeout: ACTION_TIMEOUT, meta: { retry_time: get_token_list_retry_time } });
			// 		await ctx.call(ACTION_GET_TOKEN_LIST, { code_id, address }, { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ });
			// 	}
		}
	}

	@Action()
	private async getTokenInfor(ctx: Context<TokenInfo, RetryTime>) {
		// let get_token_info_retry_time = ctx.meta.retry_time + 1;
		let code_id = ctx.params.code_id;
		let address = ctx.params.address;
		try {
			const str = `{"all_nft_info":{"token_id":"${ctx.params.token_id}"}}`;
			const stringEncode64bytes = Buffer.from(str).toString('base64');
			let urlGetOwner = `${CONTRACT_URI}${ctx.params.address}/smart/${stringEncode64bytes}`;
			let tokenInfo = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlGetOwner);
			if (tokenInfo?.data?.access?.owner !== undefined) {
				const asset = await this.createAssetObject(
					ctx.params.code_id,
					ctx.params.address,
					ctx.params.token_id,
					tokenInfo,
				);
				await this.adapter.insert(asset, { xxxxx: true });
			}
		} catch (error) {
			this.logger.error('getTokenInfor error', error);
			// 	if (MAX_RETRY_REQ <= get_token_info_retry_time) {
			// 		// await ctx.call(ACTION_GET_TOKEN_LIST, { code_id, address }, { timeout: ACTION_TIMEOUT, meta: { retry_time: get_token_info_retry_time } });
			// 		await ctx.call(ACTION_GET_TOKEN_LIST, { code_id, address }, { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ });
			// 	}
		}
	}

	async createAssetObject(code_id: Number, address: String, id: String, tokenInfo: AssetInfo) {
		let date = new Date();
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${id}`,
			code_id: code_id,
			asset_info: tokenInfo,
			constract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			history: [],
		};
	}
}
