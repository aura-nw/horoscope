/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import {
	Put,
	Method,
	Service,
	Get,
	Action,
	Post,
} from '@ourparentcenter/moleculer-decorators-extended';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { ErrorCode, ErrorMessage, GetAssetByAddressRequest, MoleculerDBService, ResponseDto, RestOptions } from '../../types';
import { IBlock } from '../../entities';
import { AssetIndexParams } from 'types/asset';
import { Types } from 'mongoose';
// import rateLimit from 'micro-ratelimit';
import { Status } from '../../model/codeid.model';
import { Ok } from 'ts-results';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset',
	version: 1,
	mixins: [dbBlockMixin],
})
export default class BlockService extends MoleculerDBService<
{
	rest: 'v1/asset';
},
IBlock
> {
	/**
	 *  @swagger
	 *
	 *  /v1/asset/indexAsset:
	 *    post:
	 *      tags:
	 *      - "Asset"
	 *      summary:  Register asset with the code id
	 *      description: Register asset with the code id
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: body
	 *          name: params
	 *          schema:
	 *            type: object
	 *            required:
	 *              - name
	 *            properties:
	 *              code_id:
	 *                type: number
	 *                description: code id
	 *      responses:
	 *        200:
	 *          description: Register result
	 *        422:
	 *          description: Missing parameters
	 */
	@Post<RestOptions>('/indexAsset', {
		name: 'indexAsset',
		restricted: ['api'],
		params: {
			code_id: ['number|integer|positive'],
		},
	})
	async indexAsset(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		let registed: boolean = false;
		return await this.broker
			.call('code_id.checkStatus', { code_id: ctx.params.code_id })
			.then((res) => {
				this.logger.info('code_id.checkStatus res', res);
				switch (res) {
					case Ok:
						this.broker.call('code_id.create', {
							_id: new Types.ObjectId(),
							code_id: ctx.params.code_id,
							status: Status.WAITING,
						});
					case Status.TBD:
						// case Status.WAITING:
						this.broker.emit('code_id.validate', ctx.params.code_id);
						registed = true;
						break;
					default:
						registed = false;
						break;
				}
				return (response = {
					code: ErrorCode.SUCCESSFUL,
					message: ErrorMessage.SUCCESSFUL,
					data: { registed },
				});
			})
			.catch((error) => {
				this.logger.error('call code_id.checkStatus error', error);
				return (response = {
					code: ErrorCode.WRONG,
					message: ErrorMessage.WRONG,
					data: { error },
				});
			});
	}
	/**
	 *  @swagger
	 *  /v1/asset/getByAddress:
	 *    get:
	 *      tags:
	 *        - Asset
	 *      summary: Get latest block
	 *      description: Get latest block
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: false
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
	 @Get('/getByAddress', {
		name: 'getByAddress',
		params: {
			chainid: { type: 'string', optional: false },
			blockHeight: { type: 'number', optional: true, convert: true },
			blockHash: { type: 'string', optional: true },
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
	async getByAddress(ctx: Context<GetAssetByAddressRequest, Record<string, unknown>>) {
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

			let needNextKey = true;
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

			// @ts-ignore
			let [resultBlock, resultCount] = await Promise.all<BlockEntity, BlockEntity>([
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
						ctx.params.countTotal === true ? resultCount[0].block?.header?.height : 0,
					nextKey: needNextKey ? resultBlock[resultBlock.length - 1]?._id : null,
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
