/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Config } from '../../common';
import {
	ErrorCode,
	ErrorMessage,
	GetAccountUnbondRequest,
	getActionConfig,
	MoleculerDBService,
	RestOptions,
} from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { LIST_NETWORK } from '../../common/constant';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { IAccountInfo, ValidatorEntity } from 'entities';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-unbonds',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [callApiMixin, dbAccountInfoMixin],
	/**
	 * Settings
	 */
})
export default class AccountUnbondsService extends MoleculerDBService<
	{
		rest: 'v1/accountunbonds';
	},
	IAccountInfo
> {
	/**
	 *  @swagger
	 *  /v1/account-unbonds:
	 *    get:
	 *      tags:
	 *        - Account Info
	 *      summary: Get account undelegations
	 *      description: Get account undelegations
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "Address need to query"
	 *      responses:
	 *        '200':
	 *          description: Account information
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
	 *                      account_unbonding:
	 *                        type: object
	 *                        properties:
	 *                          delegator_address:
	 *                            type: string
	 *                            example: 'aura123123123123'
	 *                          validator_address:
	 *                            type: string
	 *                            example: 'auravaloper123123123'
	 *                          entries:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                creation_height:
	 *                                  type: string
	 *                                  example: '100000'
	 *                                completion_time:
	 *                                  type: string
	 *                                  example: '2022-09-13T09:23:12.018Z'
	 *                                initial_balance:
	 *                                  type: string
	 *                                  example: '100000000'
	 *                                balance:
	 *                                  type: string
	 *                                  example: '100000000'
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
	 *                           example: "v1.account-info"
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
		const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		let [result, validators]: [any, any] = await Promise.all([
			this.adapter.lean({
				query: {
					address: ctx.params.address,
				},
				projection: { address: 1, account_unbonding: 1, custom_info: 1 },
			}),
			this.broker.call('v1.validator.getByCondition', {
				query: {},
			}),
		]);
		let data = Object.assign({}, result[0]);
		data.account_unbonding.map((unbond: any) => {
			let validator = validators.find(
				(val: ValidatorEntity) => val.operator_address === unbond.validator_address,
			);
			unbond.validator_description = {
				description: validator.description,
				jailed: validator.jailed,
			};
		});
		let response = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data,
		};
		return response;
	}
}
