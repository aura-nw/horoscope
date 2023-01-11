/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Context } from 'moleculer';
import { AddressParams, MoleculerDBService } from '../../types';
import { dbCW20AssetMixin } from '../../mixins/dbMixinMongoose';
import { ICW20Asset } from '../../model';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'cw20-holder',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbCW20AssetMixin],
	/**
	 * Settings
	 */
})
export default class Cw20HolderService extends MoleculerDBService<
	{
		rest: 'v1/cw20-holder';
	},
	ICW20Asset
> {
	@Action({
		name: 'act-count-by-address',
	})
	async countByAddress(ctx: Context<AddressParams>) {
		return await this.adapter.count({
			query: {
				contract_address: ctx.params.address,
			},
		});
	}
}
