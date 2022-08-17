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
	GetProposalRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { DbContextParameters, QueryOptions } from 'moleculer-db';
import { IProposal, ProposalEntity } from '../../entities';
import { LIST_NETWORK } from '../../common/constant';
import { ObjectId } from 'bson';

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
	/**
	 *  @swagger
	 *  /v1/proposal:
	 *    get:
	 *      tags:
	 *        - Proposal
	 *      summary: Get latest proposal
	 *      description: Get latest proposal
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
	 *          name: proposalId
	 *          required: false
	 *          type: string
	 *          description: "proposal Id"
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
	 *        - in: query
	 *          name: reverse
	 *          required: false
	 *          enum: ["true","false"]
	 *          default: false
	 *          type: string
	 *          description: "reverse is true if you want to get the oldest record first, default is false"
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
			proposalId: { type: 'string', optional: true, default: null },
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
			reverse: {
				type: 'boolean',
				optional: true,
				default: false,
				convert: true,
			},
		},
		cache: {
			ttl: 5,
		},
	})
	async getByChain(ctx: Context<GetProposalRequest, Record<string, unknown>>) {
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
			const proposalId = ctx.params.proposalId;
			const sort = ctx.params.reverse ? '-_id' : '_id';
			let query: QueryOptions = { 'custom_info.chain_id': ctx.params.chainid };
			let needNextKey = true;
			if (proposalId) {
				query['proposal_id'] = proposalId;
				needNextKey = false;
			}
			if (ctx.params.nextKey) {
				query._id = { $lt: new ObjectId(ctx.params.nextKey) };
				ctx.params.pageOffset = 0;
				ctx.params.countTotal = false;
			}

			let [result, count]: [any[], number] = await Promise.all([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					sort: sort,
				}),
				this.adapter.count({
					query: query,
				}),
			]);

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					proposals: result,
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
