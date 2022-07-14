/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW20AssetMixin } from '../../mixins/dbMixinMongoose';
import { Status } from '../../model/codeid.model';
import { Config } from '../../common';
import { ASSET_INDEXER_ACTION } from '../../common/constant';
import { Common, TokenInfo } from './common.service';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI = Config.CONTRACT_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;

const callApiMixin = new CallApiMixin().start();

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW20',
	version: 1,
	mixins: [callApiMixin, dbCW20AssetMixin],
	events: {
		'CW20.validate': {
			async handler(ctx: Context<any>) {
				const code_id = ctx.params.code_id;
				const chain_id = ctx.params.chain_id;
				const contract_type = ctx.params.contract_type;
				const URL = ctx.params.URL;
				// @ts-ignore
				this.logger.debug('ctx.params', code_id, chain_id, contract_type);
				// @ts-ignore
				this.checkIfContractImplementInterface(URL, chain_id, code_id);
			}
		},
		'CW20.handle': {
			async handler(ctx: Context<any>) {
				const chain_id = ctx.params.chain_id;
				const code_id = ctx.params.code_id;
				const URL = ctx.params.URL;
				// @ts-ignore
				const processingFlag = await this.broker.cacher?.get(`codeid_${chain_id}_${code_id}`);
				if (!processingFlag) {
					// @ts-ignore
					await this.broker.cacher?.set(`codeid_${chain_id}_${code_id}`, true);
					// @ts-ignore
					this.logger.debug('Asset handler registered', chain_id, code_id);
					// @ts-ignore
					await this.handleJob(URL, chain_id, code_id);
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
	async checkIfContractImplementInterface(URL: string, chain_id: string, code_id: number) {
		let cw20flag: any = null;
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			let resultCallApi = await this.callApiFromDomain(URL, path);
			if (resultCallApi?.contracts?.length > 0) {
				let i = 0;
				while (i < resultCallApi.contracts.length) {
					let address = resultCallApi.contracts[i];
					let urlGetTokenInfo = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.CW20_GET_TOKEN_INFO}`;
					let tokenInfo = await this.callApiFromDomain(URL, urlGetTokenInfo);
					if (tokenInfo?.data?.name === undefined
						|| tokenInfo?.data?.symbol === undefined
						|| tokenInfo?.data?.decimals === undefined
						|| tokenInfo?.data?.total_supply === undefined
					) {
						cw20flag = false;
						break;
					}
					let urlGetListOwner = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.CW20_GET_OWNER_LIST}`;
					let listOwnerAddress = await this.callApiFromDomain(URL, urlGetListOwner);
					if (listOwnerAddress?.data?.accounts !== undefined) {
						if (listOwnerAddress.data.accounts.length > 0) {
							const owner = listOwnerAddress.data.accounts[0];
							const str = `{"balance":{"address": "${owner}"}}`;
							const stringEncode64bytes = Buffer.from(str).toString('base64');
							let urlGetBalance = `${CONTRACT_URI}${address}/smart/${stringEncode64bytes}`;
							let balanceInfo = await this.callApiFromDomain(URL, urlGetBalance);
							cw20flag = balanceInfo?.data?.balance !== undefined;
							break;
						}
					} else {
						cw20flag = false;
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
		} while (next_key != null && cw20flag === null);
		this.logger.debug(
			'Check if cw20 interface implemented',
			cw20flag == null ? Status.TBD : cw20flag,
		);
		const condition = { code_id: code_id, 'custom_info.chain_id': chain_id };
		switch (cw20flag) {
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
				this.broker.emit('CW20.handle', { URL, chain_id, code_id });
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

	async handleJob(URL: string, chain_id: string, code_id: Number) {
		const contractList: any = await this.broker.call(
			ASSET_INDEXER_ACTION.COM_GET_CONTRACT_LIST,
			{ URL, code_id },
			{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
		);
		const insertInforPromises = await Promise.all(
			contractList.map(async (address: String) => {
				const urlGetTokenInfo = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.CW20_GET_TOKEN_INFO}`;
				const tokenInfo = await this.callApiFromDomain(URL, urlGetTokenInfo);

				const listOwnerAddress: any = await this.broker.call(
					ASSET_INDEXER_ACTION.CW20_ACTION_GET_OWNER_LIST,
					{ URL, code_id, address },
					{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
				);
				this.logger.debug(`listOwnerAddress ${JSON.stringify(listOwnerAddress)}`);
				if (listOwnerAddress != null) {
					const getInforPromises = await Promise.all(
						listOwnerAddress.data.accounts.map(async (owner: String) => {
							let balanceInfo: any = await this.broker.call(
								ASSET_INDEXER_ACTION.CW20_ACTION_GET_BALANCE,
								{ URL, code_id, address, owner },
								{ timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ },
							);
							if (balanceInfo != null) {
								const asset = await Common.createCW20AssetObject(
									code_id,
									address,
									owner,
									tokenInfo,
									balanceInfo,
								);
								await this.adapter.insert(asset);
								this.logger.debug(`Asset ${JSON.stringify(asset)} created`);
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

	@Action()
	private async getOwnerList(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		const address = ctx.params.address;
		try {
			let urlGetListToken = `${CONTRACT_URI}${address}/smart/${ASSET_INDEXER_ACTION.CW20_GET_OWNER_LIST}`;
			let listOwnerAddress = await this.callApiFromDomain(URL, urlGetListToken);
			if (listOwnerAddress?.data?.accounts !== undefined && listOwnerAddress.data.accounts.length > 0) {
				return listOwnerAddress;
				// this.logger.info("Asset already inserted", listTokenIDs.data.tokens.length);
			} else return null
		} catch (error) {
			this.logger.error('getOwnerList error', error);
		}
	}

	@Action()
	private async getBalance(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		try {
			// const str = `{"all_nft_info":{"token_id":"${ctx.params.token_id}"}}`;
			const str = `{"balance":{"address": "${ctx.params.owner}"}}`;
			const stringEncode64bytes = Buffer.from(str).toString('base64');
			let urlGetBalance = `${CONTRACT_URI}${ctx.params.address}/smart/${stringEncode64bytes}`;
			let balanceInfo = await this.callApiFromDomain(URL, urlGetBalance);
			if (balanceInfo?.data?.balance !== undefined) {
				return balanceInfo;
			} else return null;
		} catch (error) {
			this.logger.error('getBalance error', error);
		}
	}
}
