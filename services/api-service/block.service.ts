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
import { BlockEntity, IBlock } from '../../entities';
import { JsonConvert } from 'json2typescript';
import { FilterOptions, QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import { LIST_NETWORK } from '../../common/constant';
import { Utils } from '../../utils/utils';
const { performance } = require('perf_hooks');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'block',
	version: 1,
	mixins: [dbBlockMixin],
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
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4",]
	 *          type: string
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: blockHeight
	 *          required: false
	 *          type: string
	 *          description: "Block height of transaction"
	 *        - in: query
	 *          name: blockHash
	 *          required: false
	 *          type: string
	 *          description: "Block hash"
	 *        - in: query
	 *          name: operatorAddress
	 *          required: false
	 *          type: string
	 *          description: "operator address who proposed this block"
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
	 *          name: countTotal
	 *          required: false
	 *          default: false
	 *          type: boolean
	 *          description: "count total record"
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
			blockHeight: { type: 'number', optional: true, convert: true },
			blockHash: { type: 'string', optional: true },
			operatorAddress: { type: 'string', optional: true },
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
		},
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<GetBlockRequest, Record<string, unknown>>) {
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
			let query: QueryOptions = { 'custom_info.chain_id': ctx.params.chainid };
			const blockHeight = ctx.params.blockHeight;
			const blockHash = ctx.params.blockHash;
			const operatorAddress = ctx.params.operatorAddress;
			let needNextKey = true;

			if (operatorAddress) {
				console.log(Utils.bech32ToHex(operatorAddress));
			}

			if (blockHeight) {
				query['block.header.height'] = blockHeight;
				needNextKey = false;
			}
			if (blockHash) {
				query['block_id.hash'] = blockHash;
				needNextKey = false;
			}

			if (ctx.params.nextKey) {
				query._id = { $lt: new ObjectId(ctx.params.nextKey) };
				ctx.params.pageOffset = 0;
				ctx.params.countTotal = false;
			}

			let [resultBlock, resultCount]: [any[], any] = await Promise.all([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					sort: '-block.header.height',
				}),
				ctx.params.countTotal === true
					? this.adapter.find({
							query: { 'custom_info.chain_id': ctx.params.chainid },
							limit: 1,
							offset: 0,
							// @ts-ignore
							sort: '-block.header.height',
					  })
					: 0,
			]);

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					blocks: resultBlock,
					count:
						ctx.params.countTotal === true && resultCount.length
							? resultCount[0].block?.header?.height
							: 0,
					nextKey:
						needNextKey && resultBlock.length
							? resultBlock[resultBlock.length - 1]?._id
							: null,
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
