/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { ChainIdParams } from 'types/api-service/network';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'network',
	version: 1,
	/**
	 * Settings
	 */
	settings: {
		idField: 'chainid',
		// rest: '/v1/network',
	},
})
export default class NetworkService extends MoleculerDBService<
	{
		rest: 'v1/network';
	},
	{}
> {
	@Get('/', {
		name: 'status',
		params: {
			...getActionConfig.params,
			id: { type: 'string', optional: true },
			chainid: { type: 'string', optional: false },
		},
	})
	async getStatus(ctx: Context<ChainIdParams, Record<string, unknown>>) {
		let [inflation, pool, communityPool] = await Promise.all([
			this.broker.call('v1.inflation.getByChain', { chainid: ctx.params.chainid }),
			this.broker.call('v1.pool.getByChain', { chainid: ctx.params.chainid }),
			this.broker.call('v1.communitypool.getByChain', { chainid: ctx.params.chainid }),
		]);
		let result = {
			inflation: inflation,
			pool: pool,
			communityPool: communityPool,
		};
		return result;
	}
}
