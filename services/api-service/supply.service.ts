/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbSupplyMixin } from '../../mixins/dbMixinMongoose';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { ISupply } from '../../entities';
import { ChainIdParams } from '../../types/';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'supply',
	version: 1,
	mixins: [dbSupplyMixin],
})
export default class SupplyService extends MoleculerDBService<
	{
		rest: 'v1/supply';
	},
	ISupply
> {
	@Action({
		name: 'getByChain',
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		let result = await this.adapter.findOne({ 'custom_info.chain_id': params.chainid });
		return result;
	}
}
