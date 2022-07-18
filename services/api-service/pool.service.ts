/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbPoolMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { IPool } from '../../entities';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'pool',
	version: 1,
	mixins: [dbPoolMixin],
})
export default class InflationService extends MoleculerDBService<
	{
		rest: 'v1/pool';
	},
	IPool
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
