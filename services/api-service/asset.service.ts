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
import {
	ErrorCode,
	ErrorMessage,
	GetAssetByContractTypeAddressRequest,
	GetAssetByOwnerAddressRequest,
	MoleculerDBService,
	ResponseDto,
	RestOptions,
} from '../../types';
import { IBlock } from '../../entities';
import { AssetIndexParams } from '../../types/asset';
import { Types } from 'mongoose';
// import rateLimit from 'micro-ratelimit';
import { Status } from '../../model/codeid.model';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import {
	CODEID_MANAGER_ACTION,
	CONTRACT_TYPE,
	LIST_NETWORK,
	URL_TYPE_CONSTANTS,
} from '../../common/constant';
import { Utils } from '../../utils/utils';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset',
	version: 1,
	// mixins: [dbCW721AssetMixin],
})
export default class BlockService extends MoleculerDBService<
	{
		rest: 'v1/asset';
	},
	{}
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
			contractType: { type: 'string', optional: false, enum: Object.values(CONTRACT_TYPE) },
			chainId: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map(function (e) {
					return e.chainId;
				}),
			},
		},
	})
	async index(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		let registed: boolean = false;
		const code_id = ctx.params.codeId;
		const chain_id = ctx.params.chainId;
		const contract_type = ctx.params.contractType;
		return await this.broker
			.call(CODEID_MANAGER_ACTION.FIND, {
				query: { code_id, 'custom_info.chain_id': chain_id },
			})
			.then(async (res: any) => {
				this.logger.info('codeid-manager.find res', res);
				if (res.length > 0) {
					switch (res[0].status) {
						case Status.REJECTED:
							if (res[0].contract_type !== contract_type) {
								const condition = {
									code_id: code_id,
									'custom_info.chain_id': chain_id,
								};
								this.broker.call(CODEID_MANAGER_ACTION.UPDATE_MANY, {
									condition,
									update: { status: Status.WAITING, contract_type },
								});
								registed = true;
							}
							break;
						case Status.TBD:
							registed = true;
							break;
						// case Status.WAITING:
						default:
							break;
					}
				} else {
					this.broker.call(CODEID_MANAGER_ACTION.INSERT, {
						_id: new Types.ObjectId(),
						code_id,
						status: Status.WAITING,
						contract_type,
						custom_info: {
							chain_id,
							chain_name: LIST_NETWORK.find((x) => x.chainId == chain_id)?.chainName,
						},
					});
					registed = true;
				}
				this.logger.debug('codeid-manager.registed:', registed);
				if (registed) {
					const URL = await Utils.getUrlByChainIdAndType(
						chain_id,
						URL_TYPE_CONSTANTS.LCD,
					);
					this.broker.emit(`${contract_type}.validate`, { URL, chain_id, code_id });
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
	 *  /v1/asset/getByOwner:
	 *    get:
	 *      tags:
	 *        - Asset
	 *      summary: Get asset by owner
	 *      description: Get asset by owner
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: owner
	 *          required: true
	 *          type: string
	 *          description: "Owner address need to query"
	 *        - in: query
	 *          name: chainid
	 *          required: false
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1"]
	 *          type: string
	 *          description: "Chain Id of network need to query(if null it will return asset on all chainid)"
	 *        - in: query
	 *          name: countTotal
	 *          required: false
	 *          default: false
	 *          type: boolean
	 *          description: "count total record"
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/getByOwner', {
		name: 'getByOwner',
		params: {
			owner: { type: 'string', optional: false },
			chainid: {
				type: 'string',
				optional: true,
				enum: LIST_NETWORK.map(function (e) {
					return e.chainId;
				}),
			},
			countTotal: {
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
	async getByOwner(ctx: Context<GetAssetByOwnerAddressRequest, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			let query: QueryOptions = { owner: ctx.params.owner };
			if (ctx.params.chainid) {
				query['custom_info.chain_id'] = ctx.params.chainid;
			}
			this.logger.debug('query', query);
			let contractMap = Object.values(CONTRACT_TYPE);
			let assetsMap: Map<any, any> = new Map();
			const getData = Promise.all(
				contractMap.map(async (contract_type: string) => {
					const asset: any[] = await this.broker.call(
						`v1.${contract_type}-asset-manager.act-find`,
						{
							query,
						},
					);
					this.logger.info(`asset: ${JSON.stringify(asset)}`);
					let count = 0;
					if (ctx.params.countTotal === true) {
						count = await this.broker.call(
							`v1.${contract_type}-asset-manager.act-count`,
							{
								query,
							},
						);
					}
					assetsMap.set(contract_type, { asset, count });
				}),
			);
			await getData;
			const assetObj = Object.fromEntries(assetsMap);
			this.logger.debug(`assetObj: ${JSON.stringify(assetObj)}`);

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					assets: assetObj,
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

	/**
	 *  @swagger
	 *  /v1/asset/getByContractType:
	 *    get:
	 *      tags:
	 *        - Asset
	 *      summary: Get asset by contract type
	 *      description: Get asset by contract type
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: query
	 *          name: contractType
	 *          required: true
	 *          type: string
	 *          description: "Contract type need to query"
	 *        - in: query
	 *          name: chainid
	 *          required: false
	 *          type: string
	 *          enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1"]
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
	@Get('/getByContractType', {
		name: 'getByContractType',
		params: {
			contractType: { type: 'string', optional: false },
			chainid: {
				type: 'string',
				optional: true,
				enum: LIST_NETWORK.map(function (e) {
					return e.chainId;
				}),
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
	async getByContractType(
		ctx: Context<GetAssetByContractTypeAddressRequest, Record<string, unknown>>,
	) {
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
			let query: QueryOptions = {};
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

			const assets: any[] = await this.broker.call(
				`v1.${ctx.params.contractType}-asset-manager.act-find`,
				{
					query,
					limit: ctx.params.pageLimit,
					offset: ctx.params.pageOffset,
				},
			);
			let count = 0;
			if (ctx.params.countTotal === true) {
				count = await this.broker.call(
					`v1.${ctx.params.contractType}-asset-manager.act-count`,
					{
						query,
					},
				);
			}
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
