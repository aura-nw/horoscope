/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountClaimedRewardsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { GetTotalRewardsByAddress, MoleculerDBService } from '../../types';
import { IAccountClaimedRewards } from '../../entities';
import { LIST_NETWORK } from '../../common/constant';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-total-rewards',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountClaimedRewardsMixin],
	/**
	 * Settings
	 */
})
export default class AccountClaimedRewardsService extends MoleculerDBService<
	{
		rest: 'v1/accountclaimedrewards';
	},
	IAccountClaimedRewards
> {
	/**
	 *  @swagger
	 *  /v1/validator/delegator-reward-claimed:
	 *    get:
	 *      tags:
	 *        - Validator
	 *      summary: Get total claimed reward by delegator
	 *      description: Get total claimed reward by delegator
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: delegatorAddress
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "delegator address"
	 *        - in: query
	 *          name: validatorAddress
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "validator address (valoper)"
	 *      responses:
	 *        '200':
	 *          description: OK
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/', {
		name: 'delegator-reward-claimed',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			delegatorAddress: { type: 'string', optional: false },
			operatorAddress: { type: 'string', optional: false },
		},
		cache: {
			ttl: 10,
		},
	})
	async getDelegatorRewardsClaimed(
		ctx: Context<GetTotalRewardsByAddress, Record<string, unknown>>,
	) {}
}
