/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	GetTxRequest,
	MoleculerDBService,
	ResponseDto,
} from '../../types';
import { ITransaction, TransactionEntity } from '../../entities';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import { LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'transaction',
	version: 1,
	mixins: [dbTransactionMixin],
})
export default class BlockService extends MoleculerDBService<
	{
		rest: 'v1/transaction';
	},
	ITransaction
> {
	/**
	 *  @swagger
	 *  /v1/transaction:
	 *    get:
	 *      tags:
	 *        - Transaction
	 *      summary: Get latest transaction
	 *      description: Get latest transaction
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          type: string
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: blockHeight
	 *          required: false
	 *          type: string
	 *          description: "Block height of transaction"
	 *        - in: query
	 *          name: txHash
	 *          required: false
	 *          type: string
	 *          description: "Transaction hash"
	 *        - in: query
	 *          name: pageOffset
	 *          required: false
	 *          default: 0
	 *          type: number
	 *          description: "Page number, start at 0"
	 *        - in: query
	 *          name: pageLimit
	 *          required: false
	 *          default: 10
	 *          type: number
	 *          description: "number record return in a page"
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
			txHash: { type: 'string', optional: true },
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
	async getByChain(ctx: Context<GetTxRequest, Record<string, unknown>>) {
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

		const blockHeight = ctx.params.blockHeight;
		const txHash = ctx.params.txHash;
		let query: QueryOptions = {
			'custom_info.chain_id': ctx.params.chainid,
		};

		if (blockHeight) {
			query['tx_response.height'] = blockHeight;
		}
		if (txHash) {
			query['tx_response.txhash'] = txHash;
		}
		if (ctx.params.txHash) {
			ctx.params.nextKey = undefined;
			ctx.params.countTotal = false;
			ctx.params.pageOffset = 0;
		}
		if (ctx.params.nextKey) {
			query._id = { $lt: new ObjectId(ctx.params.nextKey) };
			ctx.params.pageOffset = 0;
			ctx.params.countTotal = false;
		}

		try {
			// @ts-ignore
			let [result, count] = await Promise.all<TransactionEntity, TransactionEntity>([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					sort: '-tx_response.height',
				}),
				ctx.params.countTotal === true
					? this.adapter.count({
							query: query,
					  })
					: 0,
			]);
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					blocks: result,
					count: count,
					nextKey: ctx.params.txHash ? null : result[result.length - 1]?._id,
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
