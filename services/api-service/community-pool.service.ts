/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCommunityPoolMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { ICommunityPool } from '../../entities';
import { ChainIdParams } from '../../types/';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'communitypool',
	version: 1,
	mixins: [dbCommunityPoolMixin],
})
export default class InflationService extends MoleculerDBService<
	{
		rest: 'v1/communitypool';
	},
	ICommunityPool
> {
	@Action({
		name: 'getByChain',
	})
	async getByChain(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		let result = await this.adapter.findOne({ 'custom_info.chain_id': params.chainid });
		return result;
	}
}
