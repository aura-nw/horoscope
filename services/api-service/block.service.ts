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
				type: 'number',
				optional: true,
				default: null,
				convert: true,
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
		// if (ctx.params.nextKey) {
		// 	try {
		// 		new ObjectId(ctx.params.nextKey);
		// 		// blockFindNextKey = await this.adapter.findById(ctx.params.nextKey);
		// 	} catch (error) {
		// 		return (response = {
		// 			code: ErrorCode.WRONG,
		// 			message: ErrorMessage.VALIDATION_ERROR,
		// 			data: {
		// 				message: 'The nextKey is not a valid ObjectId',
		// 			},
		// 		});
		// 	}
		// }
		try {
			let query: QueryOptions = {};
			const chainId = ctx.params.chainid;
			const blockHeight = ctx.params.blockHeight;
			const blockHash = ctx.params.blockHash;
			const operatorAddress = ctx.params.operatorAddress;
			const consensusHexAddress = ctx.params.consensusHexAddress;

			// const sort = ctx.params.reverse ? '_id' : '-_id';
			const sort = '-block.header.height';

			let needNextKey = true;
			if (blockHeight) {
				query['block.header.height'] = blockHeight;
			}
			// if (chainId) {
			// 	query['custom_info.chain_id'] = ctx.params.chainid;
			// }
			if (operatorAddress) {
				let operatorList: IValidator[] = await this.broker.call(
					'v1.validator.getByCondition',
					{
						query: {
							'custom_info.chain_id': ctx.params.chainid,
							operator_address: operatorAddress,
						},
					},
				);
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
			let projection: any = { custom_info: 0 };
			if (!blockHash && !blockHeight) {
				projection['block.last_commit'] = 0;
				projection['block.evidence'] = 0;
			}

			if (ctx.params.nextKey) {
				// query._id = { $lt: new ObjectId(ctx.params.nextKey) };
				query['block.header.height'] = { $lt: Number(ctx.params.nextKey) };
			}
			const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainid);
			if (network && network.databaseName) {
				this.adapter.useDb(network.databaseName);
			}
			let [resultBlock, resultCount]: [any[], any] = await Promise.all([
				this.adapter.lean({
					query: query,
					projection: projection,
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
						nextKey = resultBlock[resultBlock.length - 1]?.block.header.height;
					}
				} else {
					if (needNextKey) {
						nextKey = resultBlock[resultBlock.length - 2]?.block.header.height;
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
<<<<<<< HEAD
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
=======
	 *            enum: ["euphoria-1","euphoria-2","cosmoshub-4","osmosis-1"]
>>>>>>> 29e9d9857164934e725a335dc501e8d2faf2da28
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
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
	 *          description: Block result
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
	 *                      blocks:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            block_id:
	 *                              type: object
	 *                              properties:
	 *                                parts:
	 *                                  type: object
	 *                                  properties:
	 *                                    total:
	 *                                      type: number
	 *                                      example: 1
	 *                                    hash:
	 *                                      type: string
	 *                                      example: "7D045310732FBDB9DB3C31CE644E831BA450B89C6FC46E298B1589AE6BC61FCE"
	 *                                hash:
	 *                                  type: string
	 *                                  example: "0FC0669C5CC9F8C7A891F6BCE43334D5391BA36F1E178D0C10C2E77BAA5CFB9F"
	 *                            block:
	 *                              type: object
	 *                              properties:
	 *                                header:
	 *                                  type: object
	 *                                  properties:
	 *                                    version:
	 *                                      type: object
	 *                                      properties:
	 *                                        block:
	 *                                          type: number
	 *                                          example: 11
	 *                                    last_block_id:
	 *                                      type: object
	 *                                      properties:
	 *                                        parts:
	 *                                          type: object
	 *                                          properties:
	 *                                            total:
	 *                                              type: number
	 *                                              example: 1
	 *                                            hash:
	 *                                              type: string
	 *                                              example: "7D045310732FBDB9DB3C31CE644E831BA450B89C6FC46E298B1589AE6BC61FCE"
	 *                                        hash:
	 *                                          type: string
	 *                                          example: "0FC0669C5CC9F8C7A891F6BCE43334D5391BA36F1E178D0C10C2E77BAA5CFB9F"
	 *                                    chain_id:
	 *                                      type: string
	 *                                      example: "aura"
	 *                                    height:
	 *                                      type: number
	 *                                      example: 123
	 *                                    time:
	 *                                      type: string
	 *                                      example: "2022-09-06T03:05:37.931Z"
	 *                                    last_commit_hash:
	 *                                      type: string
	 *                                      example: "406AA52905BBAD518B7E39EDEA4108F3569779EA5BCDCEB5D44BED7BC296F2E0"
	 *                                    data_hash:
	 *                                      type: string
	 *                                      example: "5BA80BD845CB59539CD027253AC8F39DE8983C0713D7E22DA8867B9D08981837"
	 *                                    validators_hash:
	 *                                      type: string
	 *                                      example: "EB5CDC9D3D506F56E9E10C49FCCF3098755B8699D67F35BF3748A5572EEA033A"
	 *                                    next_validators_hash:
	 *                                      type: string
	 *                                      example: "EB5CDC9D3D506F56E9E10C49FCCF3098755B8699D67F35BF3748A5572EEA033A"
	 *                                    consensus_hash:
	 *                                      type: string
	 *                                      example: "048091BC7DDC283F77BFBF91D73C44DA58C3DF8A9CBC867405D8B7F3DAADA22F"
	 *                                    app_hash:
	 *                                      type: string
	 *                                      example: "5C97FF89AA5464245766A3BAD7C21B658D8AE405E71304B93F499DB960738633"
	 *                                    last_results_hash:
	 *                                      type: string
	 *                                      example: "21DB2576AE5F49F6FDE57AC1F1A6081134A63534956C536DCE6A25BD72917C75"
	 *                                    evidence_hash:
	 *                                      type: string
	 *                                      example: "E3B0C44298FC1C149AFBF4C8996FB92427AE41E4649B934CA495991B7852B855"
	 *                                    proposer_address:
	 *                                      type: string
	 *                                      example: "8690272AC41B780D3F009C9F50C36461C967B0C1"
	 *                            data:
	 *                              type: object
	 *                              properties:
	 *                                txs:
	 *                                  type: array
	 *                                  items:
	 *                                    type: string
	 *                                    example: "Cr4CCpwBCjcvY29zbW9zLmRpc3RyaWJ1dGlvbi52MWJldGExLk1zZ1dpdGhkcmF3RGVsZWdhdG9yUmV3YXJkEmEKK2F1cmExZ3lwdDJ3N3hnNXQ5eXI3Nmh4NnplbXdkNHh2NzJqY2trMDNyNnQSMmF1cmF2YWxvcGVyMWQzbjB2NWYyM3NxemtobGNuZXdoa3NhajhsM3g3amV5dTkzOGd4CpwBCjcvY29zbW9zLmRpc3RyaWJ1dGlvbi52MWJldGExLk1zZ1dpdGhkcmF3RGVsZWdhdG9yUmV3YXJkEmEKK2F1cmExZ3lwdDJ3N3hnNXQ5eXI3Nmh4NnplbXdkNHh2NzJqY2trMDNyNnQSMmF1cmF2YWxvcGVyMWVkdzRsd2N6M2VzbmxnemN3NjByYThtMzhrM3p5Z3oyeHRsMnFoEmkKUgpGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQOpI9dkWS6LMKVUiDKO+l6Cj42RgpHPB6zsDR5g+T9EoBIECgIIARjc/g0SEwoNCgZ1dGF1cmESAzIwMBDAmgwaQCbAXZBszJbxJBkFDQ34+gO1S0eSG8uHMa//hZ4RNjYnIhHVZfhQtdsAP+tVumfrCKifITaDFaZIiEORBlgmZSk="
	 *                            evidence:
	 *                               type: object
	 *                               properties:
	 *                                 evidence:
	 *                                   type: array
	 *                                   items:
	 *                                     type: object
	 *                            custom_info:
	 *                              type: object
	 *                              properties:
	 *                                chain_id:
	 *                                  type: string
	 *                                  example: "aura"
	 *                                chain_name:
	 *                                  type: string
	 *                                  example: "Aura network"
	 *                  count:
	 *                    type: number
	 *                  nextKey:
	 *                    type: string
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
}
