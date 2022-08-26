/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import {
	ChainIdParams,
	ErrorCode,
	ErrorMessage,
	getActionConfig,
	GetBlockRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { IBlock, IValidator } from '../../entities';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import { LIST_NETWORK } from '../../common/constant';
import { redisMixin } from '../../mixins/redis/redis.mixin';
const { performance } = require('perf_hooks');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'block',
	version: 1,
	mixins: [dbBlockMixin, redisMixin],
})
export default class BlockService extends MoleculerDBService<
	{
		rest: 'v1/block';
	},
	IBlock
> {
	/**
	 *  @swagger
	 *  /v1/block:
	 *    get:
	 *      tags:
	 *        - Block
	 *      summary: Get latest block
	 *      description: Get latest block
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: blockHeight
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Block height of transaction"
	 *        - in: query
	 *          name: blockHash
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Block hash"
	 *        - in: query
	 *          name: operatorAddress
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "operator address who proposed this block"
	 *        - in: query
	 *          name: consensusHexAddress
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "consensus hex address who proposed this block"
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
	 *          name: countTotal
	 *          required: false
	 *          schema:
	 *            type: boolean
	 *            default: false
	 *          description: "count total record"
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
			blockHeight: { type: 'number', optional: true, convert: true },
			blockHash: { type: 'string', optional: true },
			operatorAddress: { type: 'string', optional: true },
			consensusHexAddress: { type: 'string', optional: true },
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
			countTotal: {
				type: 'boolean',
				optional: true,
				default: false,
				convert: true,
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
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<GetBlockRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		let blockFindNextKey = null;
		if (ctx.params.nextKey) {
			try {
				new ObjectId(ctx.params.nextKey);
				// blockFindNextKey = await this.adapter.findById(ctx.params.nextKey);
			} catch (error) {
				return (response = {
					code: ErrorCode.WRONG,
					message: ErrorMessage.VALIDATION_ERROR,
					data: {
						message: 'The nextKey is not a valid ObjectId',
					},
				});
			}
		} else {
			// let redisClient = await this.getRedisClient();
			// let handledBlockRedis = await redisClient.get(Config.REDIS_KEY_CURRENT_BLOCK);
			// blockFindNextKey = await this.adapter.find({
			// 	query: {
			// 		'custom_info.chain_id': ctx.params.chainid,
			// 	},
			// 	//@ts-ignore
			// 	sort: '-_id',
			// 	limit: 1,
			// });
		}
		try {
			let query: QueryOptions = {};
			const chainId = ctx.params.chainid;
			const blockHeight = ctx.params.blockHeight;
			const blockHash = ctx.params.blockHash;
			const operatorAddress = ctx.params.operatorAddress;
			const consensusHexAddress = ctx.params.consensusHexAddress;
			const sort = ctx.params.reverse ? '_id' : '-_id';
			let needNextKey = true;
			if (blockHeight) {
				query['block.header.height'] = blockHeight;
			}
			if (chainId) {
				query['custom_info.chain_id'] = ctx.params.chainid;
			}
			if (operatorAddress) {
				let operatorList: IValidator[] = await this.broker.call('v1.validator.find', {
					query: {
						'custom_info.chain_id': ctx.params.chainid,
						operator_address: operatorAddress,
					},
				});
				if (operatorList.length > 0) {
					query['block.header.proposer_address'] = operatorList[0].consensus_hex_address;
				}
			}
			if (consensusHexAddress) {
				query['block.header.proposer_address'] = consensusHexAddress;
			}

			if (blockHash) {
				query['block_id.hash'] = blockHash;
				needNextKey = false;
			}

			if (ctx.params.nextKey) {
				query._id = { $lt: new ObjectId(ctx.params.nextKey) };
			}

			let [resultBlock, resultCount]: [any[], any] = await Promise.all([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit + 1,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					// sort: '-block.header.height',
					sort: sort,
				}),
				ctx.params.countTotal === true
					? this.adapter.countWithSkipLimit({
							query: query,
							skip: 0,
							limit: ctx.params.pageLimit * 5,
					  })
					: 0,
			]);

			let nextKey = null;
			if (resultBlock.length > 0) {
				if (resultBlock.length == 1) {
					if (needNextKey) {
						nextKey = resultBlock[resultBlock.length - 1]?._id;
					}
				} else {
					if (needNextKey) {
						nextKey = resultBlock[resultBlock.length - 2]?._id;
					}
				}
				if (resultBlock.length <= ctx.params.pageLimit) {
					nextKey = null;
				}

				if (nextKey) {
					resultBlock.pop();
				}
			}

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					blocks: resultBlock,
					count: resultCount,
					nextKey: nextKey,
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
