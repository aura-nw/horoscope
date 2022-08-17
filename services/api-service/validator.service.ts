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
	/**
	 *  @swagger
	 *  /v1/validator:
	 *    get:
	 *      tags:
	 *        - Validator
	 *      summary: Get validator
	 *      description: Get validator
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          type: string
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: operatorAddress
	 *          required: false
	 *          type: string
	 *          description: "operator address"
	 *        - in: query
	 *          name: status
	 *          required: false
	 *          type: string
	 *          enum: ["BOND_STATUS_UNSPECIFIED", "BOND_STATUS_UNBONDED", "BOND_STATUS_UNBONDING", "BOND_STATUS_BONDED"]
	 *          description: "status"
	 *        - in: query
	 *          name: pageLimit
	 *          required: false
	 *          default: 10
	 *          type: number
	 *          description: "number record return in a page"
	 *        - in: query
	 *          name: pageOffset
	 *          required: false
	 *          default: 0
	 *          type: number
	 *          description: "Page number, start at 0"
	 *        - in: query
	 *          name: nextKey
	 *          required: false
	 *          default:
	 *          type: string
	 *          description: "key for next page"
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
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
				max: 100,
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
			let query: QueryOptions = { 'custom_info.chain_id': ctx.params.chainid };
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
			let [result, count]: [any[], number] = await Promise.all([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset * ctx.params.pageLimit,
					// @ts-ignore
					sort: '_id',
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
}
