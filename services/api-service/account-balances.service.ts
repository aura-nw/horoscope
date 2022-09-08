/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountBalancesMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { IAccountBalances } from '../../entities/account-balances.entity';
import { DbContextParameters } from 'moleculer-db';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-balances',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountBalancesMixin],
	/**
	 * Settings
	 */
})
export default class AccountBalancesService extends MoleculerDBService<
	{
		rest: 'v1/accountbalances';
	},
	IAccountBalances
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
