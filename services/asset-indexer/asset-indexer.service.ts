/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAssetMixin } from '../../mixins/dbMixinMongoose';
import { Status } from '../../model/codeid.model';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS, ASSET_INDEXER_ACTION } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { Common } from './common';
import { chain } from 'lodash';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;

const callApiMixin = new CallApiMixin().start();


type TokenInfo = {
	chain_id: string;
	code_id: number;
	address: string;
	token_id: string;
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
			handler(ctx: Context<any>) {
				const code_id = ctx.params.code_id;
				const chain_id = ctx.params.chain_id;
				// @ts-ignore
				this.logger.debug('ctx.params.code_id', code_id, chain_id);
				// @ts-ignore
				this.checkIfContractImplementCW721Interface(chain_id, code_id);
			}
		},
		'code_id.handle': {
			async handler(ctx: Context<any>) {
				const chain_id = ctx.params.chain_id;
				const code_id = ctx.params.code_id;
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(`codeid_${chain_id}_${code_id}`);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(`codeid_${chain_id}_${code_id}`, true);
					// @ts-ignore
					this.logger.debug('Asset handler registered', chain_id, code_id);
					// @ts-ignore
					await this.handleJob(chain_id, code_id);
					// @ts-ignore
					await this.broker.cacher?.del(`codeid_${chain_id}_${code_id}`);
				}
				//TODO emit event index history of the NFT.
			},
			//TODO subcribe the event index the history of the NFT
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	async handleJob(chain_id: string, code_id: Number) {
		const URL = Utils.getUrlByChainIdAndType(chain_id, URL_TYPE_CONSTANTS.LCD);
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
				let listTokenIDs: any = await this.broker.call(
					ASSET_INDEXER_ACTION.ACTION_GET_TOKEN_LIST,
					{ chain_id, code_id, address },
					{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
				);
				// let get_token_info_retry_time = 0;
				if (listTokenIDs != null) {
					const getInforPromises = await Promise.all(
						listTokenIDs.data.tokens.map(async (token_id: String) => {
							let tokenInfo: any = await this.broker.call(
								ASSET_INDEXER_ACTION.ACTION_GET_TOKEN_INFOR,
								{ chain_id, code_id, address, token_id },
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
	async checkIfContractImplementCW721Interface(chain_id: string, code_id: number) {
		const URL = await Utils.getUrlByChainIdAndType(chain_id, URL_TYPE_CONSTANTS.LCD);
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
				this.logger.error('Call urlGetContractList unsatisfactory return', URL, path);
			}
		} while (next_key != null && cw721flag === null);
		this.logger.debug(
			'Check if cw721 interface implemented',
			cw721flag == null ? Status.TBD : cw721flag,
		);
		const condition = { code_id: code_id, 'custom_info.chain_id': chain_id };
		switch (cw721flag) {
			case null: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition,
					update: { status: Status.TBD },
				});
				break;
			}
			case true: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition,
					update: { status: Status.COMPLETED },
				});
				this.broker.emit('code_id.handle', { chain_id, code_id });
				break;
			}
			case false: {
				this.broker.call(ASSET_INDEXER_ACTION.CODEID_UPDATEMANY, {
					condition,
					update: { status: Status.REJECTED },
				});
				break;
			}
		}
	}

	@Action()
	private async getTokenList(ctx: Context<TokenInfo>) {
		const chain_id = ctx.params.chain_id;
		const URL = await Utils.getUrlByChainIdAndType(chain_id, URL_TYPE_CONSTANTS.LCD);
		// const code_id = ctx.params.code_id;
		const address = ctx.params.address;
		try {
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.GET_TOKEN_LIST}`;
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
	private async getTokenInfor(ctx: Context<TokenInfo>) {
		let chain_id = ctx.params.chain_id;
		const URL = Utils.getUrlByChainIdAndType(chain_id, URL_TYPE_CONSTANTS.LCD);
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
