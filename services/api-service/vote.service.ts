import { dbVoteMixin } from './../../mixins/dbMixinMongoose/db-vote.mixin';
import { redisMixin } from './../../mixins/redis/redis.mixin';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { LIST_NETWORK } from '../../common/constant';
import { IVote } from '../../entities/vote.entity';
import { Context } from 'moleculer';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import {
	ErrorCode,
	ErrorMessage,
	GetVoteRequest,
	MoleculerDBService,
	ValidatorVoteResponse,
} from '../../types';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'votes',
	version: 1,
	mixins: [dbVoteMixin, redisMixin],
})
export default class VoteService extends MoleculerDBService<{ rest: 'v1/votes' }, IVote> {
	/**
	 *  @swagger
	 *  /v1/votes:
	 *    get:
	 *      tags:
	 *        - Vote
	 *      summary: Get votes
	 *      description: Get votes
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: proposalid
	 *          required: true
	 *          schema:
	 *            type: number
	 *            default: 1
	 *          description: "Proposal Id"
	 *        - in: query
	 *          name: answer
	 *          required: false
	 *          schema:
	 *            type: string
	 *            enum: ['VOTE_OPTION_YES', 'VOTE_OPTION_NO', 'VOTE_OPTION_NO_WITH_VETO', 'VOTE_OPTION_ABSTAIN']
	 *          description: "Chain Id of network need to query"
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
	 *            default: "false"
	 *            type: string
	 *          description: "reverse is true if you want to get the oldest record first, default is false"
	 *      responses:
	 *        '200':
	 *          description: Vote result
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
	 *                      votes:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            voter_address:
	 *                              type: string
	 *                              example: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8'
	 *                            proposal_id:
	 *                              type: number
	 *                              example: 1
	 *                            answer:
	 *                              type: string
	 *                              example: 'Yes'
	 *                            txhash:
	 *                              type: string
	 *                              example: '698185B1800A077B30A61ADBC42958CFCCFE5C3DA0D32E0AF314C0098684CCC6'
	 *                            timestamp:
	 *                              type: string
	 *                              example: '2021-05-20T09:00:00.000Z'
	 *                            custom_info:
	 *                              type: object
	 *                              properties:
	 *                                chain_id:
	 *                                  type: string
	 *                                  example: 'aura-testnet'
	 *                                chain_name:
	 *                                  type: string
	 *                                  example: 'Aura Testnet'
	 *                      nextKey:
	 *                        type: string
	 *                        example: '63218f7c8c9c740a4dcefaf2'
	 *        422:
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
	 *                           example: "v1"
	 */
	@Get('/', {
		name: 'getVotes',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			proposalid: {
				type: 'number',
				optional: false,
				default: 1,
				integer: true,
				convert: true,
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
	async getVotes(ctx: Context<GetVoteRequest, Record<string, unknown>>) {
		if (ctx.params.nextKey && !ObjectId.isValid(ctx.params.nextKey)) {
			return {
				code: ErrorCode.WRONG,
				message: ErrorMessage.VALIDATION_ERROR,
				data: {
					message: 'The nextKey is not a valid ObjectId',
				},
			};
		}
		try {
			let query: QueryOptions = {};
			query['proposal_id'] = ctx.params.proposalid;
			const chainId = ctx.params.chainid;
			if (ctx.params.answer) query.answer = ctx.params.answer;

			if (chainId) {
				query['custom_info.chain_id'] = chainId;
			}

			let sort = 'timestamp';

			if (ctx.params.reverse) {
				sort = '-timestamp';
				if (ctx.params.nextKey) query._id = { $lt: new ObjectId(ctx.params.nextKey) };
			} else {
				if (ctx.params.nextKey) query._id = { $gt: new ObjectId(ctx.params.nextKey) };
			}

			// find pageLimit + 1 to check if there is a next page
			const votes: any[] = await this.adapter.find({
				query,
				limit: ctx.params.pageLimit + 1,
				offset: ctx.params.pageOffset,
				// @ts-ignore
				sort: sort,
			});

			// check if there is a next page
			const nextKey =
				votes.length < 1 || votes.length <= ctx.params.pageLimit
					? null
					: votes[votes.length - 2]._id.toString();

			// remove the last item if there is a next page
			if (nextKey) {
				votes.pop();
			}
			return {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					votes,
					nextKey,
				},
			};
		} catch (err) {
			return {
				code: ErrorCode.WRONG,
				message: ErrorMessage.WRONG,
				data: {
					err,
				},
			};
		}
	}

	/**
	 *  @swagger
	 *  /v1/votes/validators:
	 *    get:
	 *      tags:
	 *        - Vote
	 *      summary: Get validator votes
	 *      description: Get validator votes
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: proposalid
	 *          required: true
	 *          schema:
	 *            type: number
	 *            default: 1
	 *          description: "Proposal Id"
	 *        - in: query
	 *          name: answer
	 *          required: false
	 *          schema:
	 *            type: string
	 *            enum: ['VOTE_OPTION_YES', 'VOTE_OPTION_NO', 'VOTE_OPTION_NO_WITH_VETO', 'VOTE_OPTION_ABSTAIN', 'DID_NOT_VOTE']
	 *          description: "Chain Id of network need to query"
	 *      responses:
	 *        '200':
	 *          description: Validator Vote result
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
	 *                      votes:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            voter_address:
	 *                              type: string
	 *                              example: 'aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8'
	 *                            proposal_id:
	 *                              type: number
	 *                              example: 1
	 *                            answer:
	 *                              type: string
	 *                              example: 'Yes'
	 *                            txhash:
	 *                              type: string
	 *                              example: '698185B1800A077B30A61ADBC42958CFCCFE5C3DA0D32E0AF314C0098684CCC6'
	 *                            timestamp:
	 *                              type: string
	 *                              example: '2021-05-20T09:00:00.000Z'
	 *                            custom_info:
	 *                              type: object
	 *                              properties:
	 *                                chain_id:
	 *                                  type: string
	 *                                  example: 'aura-testnet'
	 *                                chain_name:
	 *                                  type: string
	 *                                  example: 'Aura Testnet'
	 *                      nextKey:
	 *                        type: string
	 *                        example: '63218f7c8c9c740a4dcefaf2'
	 *        422:
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
	 *                           example: "v1"
	 */
	@Get('/validators', {
		name: 'getValidatorVote',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			proposalid: {
				type: 'number',
				optional: false,
				default: 1,
				integer: true,
				convert: true,
			},
		},
		cache: {
			ttl: 10,
		},
	})
	async getValidatorVote(ctx: Context<GetVoteRequest, Record<string, unknown>>) {
		try {
			const chainId = ctx.params.chainid;
			const validators: any[] = await this.broker.call(
				'v1.validator.find',
				{
					query: {
						'custom_info.chain_id': chainId,
						status: 'BOND_STATUS_BONDED',
					},
					sort: '-percent_voting_power',
				},
				{ meta: { $cache: false } },
			);
			const validatorAccountAddress = validators.map((e) => {
				return e.account_address;
			});
			let query: QueryOptions = {
				'custom_info.chain_id': chainId,
				proposal_id: ctx.params.proposalid,
				voter_address: { $in: validatorAccountAddress },
			};
			if (ctx.params.answer) query.answer = ctx.params.answer;
			const votes: any[] = await this.adapter.find({ query });

			const validatorVotes: ValidatorVoteResponse[] = [];
			for (let i = 0; i < validators.length; i++) {
				const validator = validators[i];
				const vote = votes.find((e) => {
					return e.voter_address === validator.account_address;
				});
				const tx_hash = vote ? vote.txhash : '';
				const answer = vote ? vote.answer : '';
				const timestamp = vote ? vote.timestamp : '';
				validatorVotes.push({
					rank: (i + 1).toString(),
					percent_voting_power: validator.percent_voting_power,
					validator_address: validator.account_address,
					operator_address: validator.operator_address,
					validator_identity: validator.description.identity,
					validator_name: validator.description.moniker,
					answer,
					tx_hash,
					timestamp,
				});
			}
			return {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: validatorVotes,
			};
		} catch (err) {
			return {
				code: ErrorCode.WRONG,
				message: ErrorMessage.WRONG,
				data: {
					err,
				},
			};
		}
	}
}
