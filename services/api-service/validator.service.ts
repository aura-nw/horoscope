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
	GetByChainIdAndPageLimitRequest,
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
	})
	async getByChain(ctx: Context<GetByChainIdAndPageLimitRequest, Record<string, unknown>>) {
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
