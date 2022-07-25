/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountUnbondsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import {
	ErrorCode,
	ErrorMessage,
	GetAccountUnbondRequest,
	getActionConfig,
	MoleculerDBService,
	RestOptions,
} from '../../types';
import { IAccountUnbonds } from '../../entities';
import { DbContextParameters } from 'moleculer-db';
import { LIST_NETWORK } from '../../common/constant';
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
	/**
	 *  @swagger
	 *  /v1/account-unbonds:
	 *    get:
	 *      tags:
	 *        - Account Info
	 *      summary: Get account undelegations
	 *      description: Get account undelegations
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1"]
	 *          type: string
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          type: string
	 *          description: "Address need to query"
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/', {
		name: 'getByAddress',
		params: {
			address: { type: 'string', required: true },
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
		},
	})
	async getByAddress(ctx: Context<GetAccountUnbondRequest, Record<string, unknown>>) {
		// const params = await this.sanitizeParams(ctx, ctx.params);
		let data = await this.adapter.findOne({
			address: ctx.params.address,
			'custom_info.chain_id': ctx.params.chainid,
		});
		let response = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data,
		};
		return response;
	}
}
