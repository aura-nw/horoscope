/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	getActionConfig,
	GetTxRequest,
	GetByChainIdAndPageLimitRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { ITransaction } from '../../entities';
import { QueryOptions } from 'moleculer-db';

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
		},
		cache: {
			ttl: 10,
		},
	})
	async getByChain(ctx: Context<GetTxRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;

		const blockHeight = ctx.params.blockHeight;
		const txHash = ctx.params.txHash;
		this.logger.info(blockHeight);
		this.logger.info(txHash);
		let query: QueryOptions = {
			'custom_info.chain_id': ctx.params.chainid,
		};

		if (blockHeight) {
			query['tx_response.height'] = blockHeight;
		}
		if (txHash) {
			query['tx_response.txhash'] = txHash;
		}
		try {
			let result = await this.adapter.find({
				query: query,
				limit: ctx.params.pageLimit,
				offset: ctx.params.pageOffset,
				// @ts-ignore
				sort: '-tx_response.height',
			});
			let count = await this.adapter.count({
				query: query,
			});
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					blocks: result,
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
