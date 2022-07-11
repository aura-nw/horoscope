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
import { dbAssetMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	GetAssetByAddressRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { IBlock } from '../../entities';
import { AssetIndexParams } from '../../types/asset';
import { Types } from 'mongoose';
// import rateLimit from 'micro-ratelimit';
import { Status } from '../../model/codeid.model';
import { IAsset } from '../../model/asset.model';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import { CONTRACT_TYPE, LIST_NETWORK } from '../../common/constant';
import { error } from 'console';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset',
	version: 1,
	mixins: [dbAssetMixin],
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
	 *  /v1/asset/index:
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
	 *            properties:
	 *              codeId:
	 *                required: true
	 *                type: number
	 *                description: "Code id of stored contract"
	 *              contractType:
	 *                required: true
	 *                type: string
	 *                enum: 
	 *                - "CW721"
	 *                description: "Type of contract want to register"
	 *              chainId:
	 *                required: true
	 *                type: string
	 *                example: aura-devnet
	 *                description: "Chain Id of network"
	 *      responses:
	 *        200:
	 *          description: Register result
	 *        422:
	 *          description: Missing parameters
	 */
	@Post<RestOptions>('/index', {
		name: 'index',
		restricted: ['api'],
		params: {
			codeId: ['number|integer|positive'],
			contractType: { type: 'string', optional: false, enum: ['CW721'] },
			chainId: { type: 'string', optional: false, enum: LIST_NETWORK.map(function (e) { return e.chainId }) },
		},
	})
	async index(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		let registed: boolean = false;
		const code_id = ctx.params.codeId;
		const chain_id = ctx.params.chainId;
		const contract_type = ctx.params.contractType;
		return await this.broker
			.call('v1.code_id.checkStatus', { code_id, chain_id })
			.then((res) => {
				this.logger.info('code_id.checkStatus res', res);
				switch (res) {
					case 'NotFound':
						this.broker.call('v1.code_id.create', {
							_id: new Types.ObjectId(),
							code_id,
							status: Status.WAITING,
							custom_info: {
								chain_id,
								chain_name: LIST_NETWORK.find(x => x.chainId == chain_id)?.chainName,
							}
						});
					case Status.TBD:
						// case Status.WAITING:
						this.broker.emit('code_id.validate', { chain_id, code_id });
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
	 *          name: address
	 *          required: true
	 *          type: string
	 *          description: "Address need to query"
	 *        - in: query
	 *          name: chainid
	 *          required: false
	 *          type: string
	 *          description: "Chain Id of network need to query"
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
			address: { type: 'string', optional: false },
			chainid: { type: 'string', optional: true, enum: LIST_NETWORK.map(function (e) { return e.chainId }) },
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
			let query: QueryOptions = { owner: ctx.params.address };
			if (ctx.params.chainid) {
				query['custom_info.chain_id'] = ctx.params.chainid;
			}
			let needNextKey = true;
			if (ctx.params.nextKey) {
				query._id = { $lt: new ObjectId(ctx.params.nextKey) };
				ctx.params.pageOffset = 0;
				ctx.params.countTotal = false;
			}

			this.logger.info('query', query);
			// @ts-ignore
			let [assets, count] = await Promise.all<IAsset, IAsset>([
				this.adapter.find({
					query: query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
					// @ts-ignore
					// sort: '-block.header.height',
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
					assets,
					count,
					nextKey: needNextKey ? assets[assets.length - 1]?._id : null,
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
