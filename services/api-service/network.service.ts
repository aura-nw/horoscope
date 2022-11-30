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

	/**
	 *  @swagger
	 *  /v1/network/status:
	 *    get:
	 *      tags:
	 *        - Network
	 *      summary: Get status network (inflation, pool, community pool, supply)
	 *      description: Get status network (inflation, pool, community pool, supply)
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
<<<<<<< HEAD
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
=======
	 *            enum: ["euphoria-1","euphoria-2","cosmoshub-4","osmosis-1"]
>>>>>>> 29e9d9857164934e725a335dc501e8d2faf2da28
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
	 *      responses:
	 *        '200':
	 *          description: Network information
	 *          content:
	 *            application/json:
	 *              schema:
	 *                type: object
	 *                properties:
	 *                  code:
	 *                    type: number
	 *                    example: 200
	 *                  message:
	 *                    type: string
	 *                    example: "Successful"
	 *                  data:
	 *                    type: object
	 *                    properties:
	 *                      inflation:
	 *                        type: object
	 *                        properties:
	 *                          inflation:
	 *                            type: string
	 *                            example: '0.255222222222522525'
	 *                      pool:
	 *                        type: object
	 *                        properties:
	 *                          bonded_tokens:
	 *                            type: string
	 *                            example: "1000000000"
	 *                          not_bonded_tokens:
	 *                            type: string
	 *                            example: "1000000000"
	 *                      communityPool:
	 *                        type: object
	 *                        properties:
	 *                          pool:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: string
	 *                                  example: "100000"
	 *                                denom:
	 *                                  type: string
	 *                                  example: "uaura"
	 *                      supply:
	 *                        type: object
	 *                        properties:
	 *                          supply:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: "uaura"
	 *                                amount:
	 *                                  type: string
	 *                                  example: "1000000"
	 *        '422':
	 *          description: Bad request
	 *          content:
	 *            application/json:
	 *              schema:
	 *                type: object
	 *                properties:
	 *                  name:
	 *                    type: string
	 *                    example: "ValidationError"
	 *                  message:
	 *                    type: string
	 *                    example: "Parameters validation error!"
	 *                  code:
	 *                    type: number
	 *                    example: 422
	 *                  type:
	 *                    type: string
	 *                    example: "VALIDATION_ERROR"
	 *                  data:
	 *                    type: array
	 *                    items:
	 *                       type: object
	 *                       properties:
	 *                         type:
	 *                           type: string
	 *                           example: "required"
	 *                         message:
	 *                           type: string
	 *                           example: "The 'chainid' field is required."
	 *                         field:
	 *                           type: string
	 *                           example: chainid
	 *                         nodeID:
	 *                           type: string
	 *                           example: "node1"
	 *                         action:
	 *                           type: string
	 *                           example: "v1.network.chain"
	 */
}
