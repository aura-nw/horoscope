/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	getActionConfig,
	GetValidatorRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { DbContextParameters, QueryOptions } from 'moleculer-db';
import { IValidator } from '../../entities';
import { BOND_STATUS, LIST_NETWORK } from '../../common/constant';
import { ObjectId } from 'bson';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'validator',
	version: 1,
	mixins: [dbValidatorMixin],
})
export default class ValidatorService extends MoleculerDBService<
	{
		rest: 'v1/validator';
	},
	IValidator
> {
	@Get('/', {
		name: 'getByChain',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			operatorAddress: { type: 'string', optional: true, default: null },
			status: {
				type: 'string',
				optional: true,
				enum: Object.keys(BOND_STATUS).map((e) => {
					return e;
				}),
			},
			pageLimit: {
				type: 'number',
				optional: true,
				default: 10,
				integer: true,
				convert: true,
				min: 1,
				max: 1000,
			},
			pageOffset: {
				type: 'number',
				optional: true,
				default: 0,
				integer: true,
				convert: true,
				min: 0,
				max: 100,
			},
			nextKey: {
				type: 'string',
				optional: true,
				default: null,
			},
		},
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<GetValidatorRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		if (ctx.params.nextKey) {
			try {
				new ObjectId(ctx.params.nextKey);
			} catch (error) {
				return (response = {
					code: ErrorCode.WRONG,
					message: ErrorMessage.VALIDATION_ERROR,
					data: {
						message: 'The nextKey is not a valid ObjectId',
					},
				});
			}
		}
		try {
			const operatorAddress = ctx.params.operatorAddress;
			const status = ctx.params.status;
			let needNextKey = true;
			let query: QueryOptions = {};
			if (operatorAddress) {
				query['operator_address'] = operatorAddress;
			}
			if (status) {
				query['status'] = status;
			}
			if (ctx.params.nextKey) {
				query._id = { $gt: new ObjectId(ctx.params.nextKey) };
				ctx.params.pageOffset = 0;
				ctx.params.countTotal = false;
			}
			const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainid);
			if (network && network.databaseName) {
				this.adapter.useDb(network.databaseName);
			}
			let [result, count]: [any[], number] = await Promise.all([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					sort: '-percent_voting_power',
				}),
				this.adapter.count({
					query: query,
				}),
			]);
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					validators: result,
					count: count,
					nextKey: needNextKey && result.length ? result[result.length - 1]._id : null,
				},
			};
		} catch (error) {
			response = {
				code: ErrorCode.WRONG,
				message: ErrorMessage.WRONG,
				data: {
					error,
				},
			};
		}

		return response;
	}

	@Action({
		name: 'getAllByChain',
		cache: {
			ttl: 10,
		},
	})
	async getAllByChain(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		let result = await this.adapter.find({ query: { 'custom_info.chain_id': params.chainId } });
		return result;
	}

	@Action()
	async getByCondition(ctx: Context<DbContextParameters>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		const network = LIST_NETWORK.find((x) => x.chainId == params.query['custom_info.chain_id']);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		delete params.query['custom_info.chain_id'];
		// @ts-ignore
		let result = await this.adapter.find({ query: params.query, sort: params.sort });
		return result;
	}

	/**
	 *  @swagger
	 *  /v1/validator:
	 *    get:
	 *      tags:
	 *        - Validator
	 *      summary: Get validator information in a network
	 *      description: Get validator information in a network
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["euphoria-2","cosmoshub-4","osmosis-1"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
	 *        - in: query
	 *          name: operatorAddress
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "operator address"
	 *        - in: query
	 *          name: status
	 *          required: false
	 *          schema:
	 *            type: string
	 *            enum: ["BOND_STATUS_UNSPECIFIED", "BOND_STATUS_UNBONDED", "BOND_STATUS_UNBONDING", "BOND_STATUS_BONDED"]
	 *          description: "status"
	 *        - in: query
	 *          name: pageLimit
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 10
	 *          description: "number record return in a page"
	 *        - in: query
	 *          name: pageOffset
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 0
	 *          description: "Page number, start at 0"
	 *        - in: query
	 *          name: nextKey
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "key for next page"
	 *      responses:
	 *        '200':
	 *          description: List validator
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
	 *                      validators:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            consensus_pubkey:
	 *                              type: object
	 *                              properties:
	 *                                '@type':
	 *                                  type: string
	 *                                  example: '/cosmos.crypto.ed25519.PubKey'
	 *                                key:
	 *                                  type: string
	 *                                  example: 'xxxxxxxxxxxxxxxxxxxxxxxx'
	 *                            description:
	 *                              type: object
	 *                              properties:
	 *                                moniker:
	 *                                  type: string
	 *                                  example: 'validator one'
	 *                                identity:
	 *                                  type: string
	 *                                  example: 'validator one, earth'
	 *                                website:
	 *                                  type: string
	 *                                  example: 'validatorone.aura'
	 *                                security_contact:
	 *                                  type: string
	 *                                  example: 'validate@one.aura'
	 *                                details:
	 *                                  type: string
	 *                                  example: 'validator one details'
	 *                            commission:
	 *                              type: object
	 *                              properties:
	 *                                commission_rates:
	 *                                  type: object
	 *                                  properties:
	 *                                    rate:
	 *                                      type: string
	 *                                      example: '0.00050000000'
	 *                                    max_rate:
	 *                                      type: string
	 *                                      example: '0.20000000000'
	 *                                    max_change_rate:
	 *                                      type: string
	 *                                      example: '0.05000000000'
	 *                                update_time:
	 *                                  type: string
	 *                                  example: '2022-07-13T02:00:00Z'
	 *                            val_signing_info:
	 *                              type: object
	 *                              properties:
	 *                                address:
	 *                                  type: string
	 *                                  example: 'aura123123123123123123'
	 *                                start_height:
	 *                                  type: string
	 *                                  example: '0'
	 *                                index_offset:
	 *                                  type: string
	 *                                  example: '100000'
	 *                                jailed_until:
	 *                                  type: string
	 *                                  example: '2022-07-13T02:00:00Z'
	 *                                tombstoned:
	 *                                  type: boolean
	 *                                  example: false
	 *                                missed_blocks_counter:
	 *                                  type: string
	 *                                  example: '0'
	 *                            self_delegation_balance:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '10000000000'
	 *                            custom_info:
	 *                              type: object
	 *                              properties:
	 *                                chain_id:
	 *                                  type: string
	 *                                  example: 'aura'
	 *                                chain_name:
	 *                                  type: string
	 *                                  example: 'Aura network'
	 *                            operator_address:
	 *                              type: string
	 *                              example: 'auravaloper123123123123'
	 *                            jailed:
	 *                              type: boolean
	 *                              example: false
	 *                            status:
	 *                              type: string
	 *                              example: 'BOND_STATUS_BONDED'
	 *                            delegator_shares:
	 *                              type: string
	 *                              example: '1'
	 *                            unbonding_height:
	 *                              type: string
	 *                              example: '0'
	 *                            unbonding_time:
	 *                              type: string
	 *                              example: '1970-01-01T00:00:00Z'
	 *                            min_self_delegation:
	 *                              type: string
	 *                              example: '1'
	 *                            consensus_hex_address:
	 *                              type: string
	 *                              example: 'CCCCCCCCCCCCCCCCCCC'
	 *                            uptime:
	 *                              type: number
	 *                              example: 100
	 *                            account_address:
	 *                              type: string
	 *                              example: 'aura123123123123123123'
	 *
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
	 *                           example: "v1.validator"
	 */
}
