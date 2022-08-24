/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import {
	getActionConfig,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
	ErrorCode,
	ErrorMessage,
} from '../../types';
import { ChainIdParams } from '../../types';
import { LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'network',
	version: 1,
})
export default class NetworkService extends MoleculerDBService<
	{
		rest: 'v1/network';
	},
	{}
> {
	/**
	 *  @swagger
	 *  /v1/network/status:
	 *    get:
	 *      tags:
	 *        - Network
	 *      summary: Get status network
	 *      description: Get status network
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *      responses:
	 *        '200':
	 *          description: OK
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/', {
		name: 'status',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
		},
		cache: {
			ttl: 5,
		},
	})
	async getStatus(ctx: Context<ChainIdParams, Record<string, unknown>>) {
		let [inflation, pool, communityPool, supply] = await Promise.all([
			this.broker.call('v1.inflation.getByChain', { chainid: ctx.params.chainid }),
			this.broker.call('v1.pool.getByChain', { chainid: ctx.params.chainid }),
			this.broker.call('v1.communitypool.getByChain', { chainid: ctx.params.chainid }),
			this.broker.call('v1.supply.getByChain', { chainid: ctx.params.chainid }),
		]);
		let result: ResponseDto = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				inflation,
				pool,
				communityPool,
				supply,
			},
		};
		return result;
	}
}
