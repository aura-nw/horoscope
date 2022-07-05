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
import { DbContextParameters } from 'moleculer-db';
import { IValidator } from '../../entities';

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
	 *          description: "Chain Id of network need to query"
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
			chainid: { type: 'string', optional: false },
			pageLimit: {
				type: 'number',
				optional: true,
				default: 10,
				integer: true,
				convert: true,
				max: 100,
			},
			pageOffset: {
				type: 'number',
				optional: true,
				default: 0,
				integer: true,
				convert: true,
				max: 100,
			},
		},
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<GetValidatorRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			let result = await this.adapter.find({
				query: { 'custom_info.chain_id': ctx.params.chainid },
				limit: ctx.params.pageLimit,
				offset: ctx.params.pageOffset,
			});
			let count = await this.adapter.count({
				query: { 'custom_info.chain_id': ctx.params.chainid },
			});
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					validators: result,
					count: count,
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
