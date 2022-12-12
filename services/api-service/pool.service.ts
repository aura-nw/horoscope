/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { DbContextParameters } from 'moleculer-db';
import { dbPoolMixin } from '../../mixins/dbMixinMongoose';
import { MoleculerDBService } from '../../types';
import { IPool } from '../../entities';
import { LIST_NETWORK } from '../../common/constant';

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
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		const network = LIST_NETWORK.find((x) => x.chainId === params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const result = await this.adapter.findOne({});
		return result;
	}
}
