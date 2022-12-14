/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { MoleculerDBService } from '../../types';
import { IAccountInfo } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-stats',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountInfoMixin],
	/**
	 * Settings
	 */
})
export default class AccountStatsService extends MoleculerDBService<
	{
		rest: 'v1/account-stats';
	},
	IAccountInfo
> {
	@Action({
		name: 'countTotal',
		cache: {
			ttl: 10,
		},
	})
	async countTotal() {
		const result = await this.adapter.count({
			query: {},
		});
		return result;
	}
}
