/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountUnbondsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { IAccountUnbonds } from '../../entities';
import { DbContextParameters } from 'moleculer-db';
import { ChainIdParams } from 'types/api-service/network';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-unbonds',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountUnbondsMixin],
	/**
	 * Settings
	 */
})
export default class AccountUnbondsService extends MoleculerDBService<
	{
		rest: 'v1/accountunbonds';
	},
	IAccountUnbonds
> {
	@Action({
		name: 'getByAddress',
	})
	async getByAddress(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		let result = await this.adapter.findOne({ address: params.address, 'custom_info.chain_id': params.chainid });
		return result;
	}
}
