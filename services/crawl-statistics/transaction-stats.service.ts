/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Context } from 'moleculer';
import { MoleculerDBService, QueryTransactionStatsParams } from '../../types';
import { ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'transaction-stats',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbTransactionMixin],
	/**
	 * Settings
	 */
})
export default class TransactionStatsService extends MoleculerDBService<
	{
		rest: 'v1/transaction-stats';
	},
	ITransaction
> {
	@Action({
		name: 'act-find',
	})
	async find(ctx: Context<QueryTransactionStatsParams>) {
		const result = await this.adapter.lean({
			query: ctx.params.query,
			sort: ctx.params.sort,
			limit: ctx.params.limit,
		});
		return result;
	}
}
