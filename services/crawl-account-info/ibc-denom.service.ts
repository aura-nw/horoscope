/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Context } from 'moleculer';
import { JsonConvert } from 'json2typescript';
import { MoleculerDBService, QueryIBCDenomParams } from '../../types';
import { IBCDenomEntity, IIBCDenom } from '../../entities';
import { dbIBCDenomMixin } from '../../mixins/dbMixinMongoose';
import { LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'ibc-denom',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbIBCDenomMixin],
	/**
	 * Settings
	 */
})
export default class IBCDenomService extends MoleculerDBService<
	{
		rest: 'v1/ibc-denom';
	},
	IIBCDenom
> {
	@Action({
		name: 'getByHash',
		cache: {
			ttl: 10,
		},
	})
	async getByHash(ctx: Context<QueryIBCDenomParams>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const result = await this.adapter.findOne({ hash: ctx.params.hash });
		return result;
	}

	@Action()
	async addNewDenom(ctx: Context<QueryIBCDenomParams>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const ibcDenom = {} as IBCDenomEntity;
		const item: IBCDenomEntity = new JsonConvert().deserializeObject(ibcDenom, IBCDenomEntity);
		item.denom = ctx.params.denom;
		item.hash = ctx.params.hash;
		const result = await this.adapter.insert(item);
		return result;
	}
}
