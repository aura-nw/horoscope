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
import { LIST_NETWORK, PROPOSAL_STATUS } from '../../common/constant';
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
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: proposalId
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "proposal Id"
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
	 *        - in: query
	 *          name: reverse
	 *          required: false
	 *          schema:
	 *            enum: ["true","false"]
	 *            type: string
	 *            default: "false"
	 *          description: "reverse is true if you want to get the oldest record first, default is false"
	 *      responses:
	 *        '200':
	 *          description: Result list proposal
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
	 *                      proposals:
	 *                        type: array
	 *                        items:
	 *                          properties:
	 *                            content:
	 *                              type: object
	 *                              properties:
	 *                                "@type":
	 *                                  type: string
	 *                                  example: "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal"
	 *                                title:
	 *                                  type: string
	 *                                  example: "proposal create validator"
	 *                                description:
	 *                                  type: string
	 *                                  example: "New proposal to create validator"
	 *                                changes:
	 *                                  type: array
	 *                                  items:
	 *                                    type: object
	 *                            tally:
	 *                              type: object
	 *                              properties:
	 *                                yes:
	 *                                  type: string
	 *                                  example: "0"
	 *                                abstain:
	 *                                  type: string
	 *                                  example: "0"
	 *                                no:
	 *                                  type: string
	 *                                  example: "0"
	 *                                no_with_veto:
	 *                                  type: string
	 *                                  example: "0"
	 *                            final_tally_result:
	 *                              type: object
	 *                              properties:
	 *                                yes:
	 *                                  type: string
	 *                                  example: "0"
	 *                                abstain:
	 *                                  type: string
	 *                                  example: "0"
	 *                                no:
	 *                                  type: string
	 *                                  example: "0"
	 *                                no_with_veto:
	 *                                  type: string
	 *                                  example: "0"
	 *                            custom_info:
	 *                              type: object
	 *                              properties:
	 *                                chain_id:
	 *                                  type: string
	 *                                  example: "aura"
	 *                                chain_name:
	 *                                  type: string
	 *                                  example: "Aura network"
	 *                            proposal_id:
	 *                              type: number
	 *                              example: 1
	 *                            status:
	 *                              type: string
	 *                              example: "PROPOSAL_STATUS_REJECTED"
	 *                            submit_time:
	 *                              type: string
	 *                              example: "2022-09-07T02:38:44.357Z"
	 *                            deposit_end_time:
	 *                              type: string
	 *                              example: "2022-09-07T02:38:44.357Z"
	 *                            total_deposit:
	 *                              type: array
	 *                              items:
	 *                                type: object
	 *                                properties:
	 *                                  denom:
	 *                                    type: string
	 *                                    example: "uaura"
	 *                                  amount:
	 *                                    type: string
	 *                                    example: "10000"
	 *                            voting_start_time:
	 *                              type: string
	 *                              example: "2022-09-07T02:38:44.357Z"
	 *                            voting_end_time:
	 *                              type: string
	 *                              example: "2022-09-07T02:38:44.357Z"
	 *                            deposit:
	 *                              type: array
	 *                              items:
	 *                                type: object
	 *                                properties:
	 *                                  amount:
	 *                                    type: object
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
	 *                           example: "v1.block.chain"
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
			const sort = ctx.params.reverse ? '_id' : '-_id';
			let query: QueryOptions = { 'custom_info.chain_id': ctx.params.chainid };
			let needNextKey = true;
			if (proposalId) {
				query['proposal_id'] = proposalId;
				needNextKey = false;
			} else {
				query['status'] = { $ne: PROPOSAL_STATUS.PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT };
			}
			if (ctx.params.nextKey) {
				if (ctx.params.reverse) {
					query._id = { $gt: new ObjectId(ctx.params.nextKey) };
				} else {
					query._id = { $lt: new ObjectId(ctx.params.nextKey) };
				}

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
