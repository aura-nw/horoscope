/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	getActionConfig,
	GetProposalByChainIdRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { IProposal } from '../../entities';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'proposal',
	version: 1,
	mixins: [dbProposalMixin],
})
export default class ProposalService extends MoleculerDBService<
	{
		rest: 'v1/proposal';
	},
	IProposal
> {
	@Get('/', {
		name: 'getByChain',
		params: {
			chainid: { type: 'string', optional: false },
			pageLimit: {
				type: 'number',
				optional: true,
				default: 10,
				positive: true,
				integer: true,
				convert: true,
				max: 100,
			},
			pageOffset: {
				type: 'number',
				optional: true,
				default: 0,
				positive: true,
				integer: true,
				convert: true,
				max: 100,
			},
		},
	})
	async getByChain(ctx: Context<GetProposalByChainIdRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			let result = await this.adapter.find({
				query: { 'custom_info.chain_id': ctx.params.chainid },
				limit: ctx.params.pageLimit,
				offset: ctx.params.pageOffset,
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				sort: '-proposal_id',
			});
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					result,
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
