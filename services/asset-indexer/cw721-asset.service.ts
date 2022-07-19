/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { CallingOptions, Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { Status } from '../../model/codeid.model';
import { Config } from '../../common';
import { CODEID_MANAGER_ACTION, COMMON_ACTION, CW721_ACTION, ENRICH_TYPE, CONTRACT_TYPE } from '../../common/constant';
import { Common, TokenInfo } from './common.service';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

const callApiMixin = new CallApiMixin().start();

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721',
	version: 1,
	mixins: [callApiMixin, dbCW721AssetMixin],
	events: {
		'CW721.validate': {
			async handler(ctx: Context<any>) {
				const code_id = ctx.params.code_id;
				const chain_id = ctx.params.chain_id;
				// const contract_type = ctx.params.contract_type;
				const URL = ctx.params.URL;
				// @ts-ignore
				this.logger.debug('ctx.params', code_id, chain_id, CONTRACT_TYPE.CW721);
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(`validate_codeid_${chain_id}_${code_id}`);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(`validate_codeid_${chain_id}_${code_id}`, true);
					// @ts-ignore
					await this.checkIfContractImplementInterface(URL, chain_id, code_id);
					// @ts-ignore
					await this.broker.cacher?.del(`validate_codeid_${chain_id}_${code_id}`);
				}
			}
		},
		'CW721.handle': {
			async handler(ctx: Context<any>) {
				const chain_id = ctx.params.chain_id;
				const code_id = ctx.params.code_id;
				const URL = ctx.params.URL;
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(`handle_codeid_${chain_id}_${code_id}`);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(`handle_codeid_${chain_id}_${code_id}`, true);
					// @ts-ignore
					this.logger.debug('Asset handler registered', chain_id, code_id);
					// @ts-ignore
					await this.handleJob(URL, chain_id, code_id);
					// @ts-ignore
					await this.broker.cacher?.del(`handle_codeid_${chain_id}_${code_id}`);
				}
				//TODO emit event index history of the NFT.
			},
			//TODO subcribe the event index the history of the NFT
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	async checkIfContractImplementInterface(URL: string, chain_id: string, code_id: number) {
		let cw721flag: any = null;
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
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
			cw721flag == null ? Status.TBD : cw721flag,
		);
		const condition = { code_id: code_id, 'custom_info.chain_id': chain_id };
		switch (cw721flag) {
			case null: {
				this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
					condition,
					update: { status: Status.TBD },
				});
				break;
			}
			case true: {
				this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
					condition,
					update: { status: Status.COMPLETED },
				});
				this.broker.emit('CW721.handle', { URL, chain_id, code_id });
				break;
			}
			case false: {
				this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
					condition,
					update: { status: Status.REJECTED },
				});
				break;
			}
		}
	}
	async handleJob(URL: string, chain_id: string, code_id: Number) {
		const contractList: any = await this.broker.call(
			COMMON_ACTION.GET_CONTRACT_LIST,
			{ URL, code_id },
			OPTs,
		);
		const insertInforPromises = await Promise.all(
			contractList.map(async (address: String) => {
				await this.broker.call(
					CW721_ACTION.ENRICH_DATA,
					[{ URL, chain_id, code_id, address }, ENRICH_TYPE.INSERT],
					OPTs,
				);

			})
		);
		await insertInforPromises;
		this.logger.debug('Asset handler DONE!', contractList.length);
	}

	@Action()
	private async enrichData(ctx: Context<[TokenInfo, string]>) {
		const URL = ctx.params[0].URL;
		const address = ctx.params[0].address;
		const code_id = ctx.params[0].code_id;
		const typeEnrich = ctx.params[1];

		let listTokenIDs: any = await this.broker.call(
			CW721_ACTION.GET_TOKEN_LIST,
			{ URL, code_id, address },
			OPTs,
		);

		if (listTokenIDs != null) {
			const getInforPromises = await Promise.all(
				listTokenIDs.data.tokens.map(async (token_id: String) => {
					let tokenInfo: any = await this.broker.call(
						CW721_ACTION.GET_TOKEN_INFOR,
						{ URL, code_id, address, token_id },
						OPTs,
					);
					if (tokenInfo != null) {
						const asset = await Common.createCW721AssetObject(
							code_id,
							address,
							token_id,
							tokenInfo,
						);
						await this.broker.call(
							`v1.cw721-asset-manager.${typeEnrich}`,
							asset,
							OPTs,
						);
					}
				}),
			);
			await getInforPromises;
		}
	}

	@Action()
	private async getTokenList(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		const address = ctx.params.address;
		try {
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${CW721_ACTION.URL_GET_TOKEN_LIST}`;
			let listTokenIDs = await this.callApiFromDomain(URL, urlGetListToken);
			if (listTokenIDs?.data?.tokens !== undefined && listTokenIDs.data.tokens.length > 0) {
				return listTokenIDs;
			} else return null
		} catch (error) {
			this.logger.error('getTokenList error', error);
		}
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
}
