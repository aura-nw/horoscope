/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Config } from '../../common';
import { Types } from 'mongoose';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const callApiMixin = new CallApiMixin().start();
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import moleculer, { Context } from 'moleculer';
import { LIST_NETWORK } from '../../common/constant';

type CW721AssetInfo = {
	data: {
		access: {
			owner: String;
		};
	};
};

type CW20BalanceInfo = {
	data: {
		balance: string;
	};
};

type CW20AssetInfo = {
	data: {
		name: string;
		symbol: string;
		decimals: number;
		total_supply: string;
	};
};

export type TokenInfo = {
	URL: string;
	chain_id: string;
	code_id: number;
	address: string;
	token_id: string;
	owner: string;
};

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset-common',
	version: 1,
	mixins: [callApiMixin],
})
export default class CommonService extends moleculer.Service {
	@Action()
	private async getContractListByCodeID(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		const code_id = ctx.params.code_id;
		let contractList: any[] = [];
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			// @ts-ignore
			let resultCallApi = await this.callApiFromDomain(URL, path);
			if (resultCallApi?.contracts?.length > 0) {
				contractList.push(...resultCallApi.contracts);
				next_key = resultCallApi.pagination.next_key;
				if (next_key === null) {
					break;
				}
				path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
			} else {
				// @ts-ignore
				this.logger.error('Call urlGetContractList return error', path);
			}
		} while (next_key != null);
		return contractList;
	}
}

export class Common {
	public static createCW721AssetObject = function (
		code_id: Number,
		address: String,
		id: String,
		tokenInfo: CW721AssetInfo,
		chain_id: String,
	) {
		let network = LIST_NETWORK.find((item) => item.chainId === chain_id);
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${id}`,
			code_id: code_id,
			asset_info: tokenInfo,
			contract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			is_burned: false,
		};
	};
	public static createCW20AssetObject = function (
		code_id: Number,
		address: String,
		owner: String,
		tokenInfo: CW20AssetInfo,
		balanceInfo: CW20BalanceInfo,
		chain_id: String,
	) {
		let network = LIST_NETWORK.find((item) => item.chainId === chain_id);
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${owner}`,
			code_id: code_id,
			asset_info: tokenInfo,
			contract_address: address,
			owner: owner,
			balance: balanceInfo?.data?.balance,
			percent_hold:
				Number(
					(BigInt(balanceInfo?.data?.balance) * BigInt(100000000)) /
						BigInt(tokenInfo?.data?.total_supply),
				) / 1000000,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
		};
	};
}
