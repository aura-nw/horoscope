/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	GetPowerEventTxRequest,
	GetTxRequest,
	ISearchTxQuery,
	MoleculerDBService,
	ResponseDto,
	ResponseFromRPC,
} from '../../types';
import { ITransaction, TransactionEntity } from '../../entities';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import {
	BASE_64_ENCODE,
	LIST_NETWORK,
	SEARCH_TX_QUERY,
	URL_TYPE_CONSTANTS,
} from '../../common/constant';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { Utils } from '../../utils/utils';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { Config } from '../../common';
import { add, flatten } from 'lodash';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'transaction',
	version: 1,
	mixins: [dbTransactionMixin, callApiMixin],
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
	 *      summary: Get latest transaction or get with condition
	 *      description: Get latest transaction or get with condition
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
	 *          name: txHash
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Transaction hash"
	 *        - in: query
	 *          name: address
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Address in transaction with native coin"
	 *        - in: query
	 *          name: addressInContract
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Address in transaction with token from smart contract"
	 *        - in: query
	 *          name: searchType
	 *          required: false
	 *          schema:
	 *            type: string
	 *            enum: ["transfer","proposal_deposit", "proposal_vote", "delegate", "redelegate", "instantiate", "execute", "wasm"]
	 *          description: "Search type event"
	 *        - in: query
	 *          name: searchKey
	 *          required: false
	 *          schema:
	 *            type: string
	 *            enum: ["sender","recipient","proposal_id", "validator", "destination_validator", "_contract_address", "token_id"]
	 *          description: "Search key event"
	 *        - in: query
	 *          name: searchValue
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Search value event"
	 *        - in: query
	 *          name: query
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Search query with format A.B=C,D.E=F"
	 *        - in: query
	 *          name: pageOffset
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 0
	 *          description: "Page number, start at 0"
	 *        - in: query
	 *          name: pageLimit
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 10
	 *          description: "number record return in a page"
	 *        - in: query
	 *          name: countTotal
	 *          required: false
	 *          schema:
	 *            type: boolean
	 *            default: "false"
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
	 *            type: boolean
	 *            default: "false"
	 *          description: "reverse is true if you want to get the oldest record first, default is false"
	 *      responses:
	 *        '200':
	 *          description: List transaction
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
	 *                      transaction:
	 *                        type: object
	 *                        properties:
	 *                          tx:
	 *                            type: object
	 *                            properties:
	 *                              body:
	 *                                type: object
	 *                                properties:
	 *                                  messages:
	 *                                    type: array
	 *                                    items:
	 *                                      type: object
	 *                                      properties:
	 *                                        '@type':
	 *                                          type: string
	 *                                          example: '/cosmos.staking.v1beta1.MsgDelegate'
	 *                                        delegator_address:
	 *                                          type: string
	 *                                          example: 'aura123123123123'
	 *                                        validator_address:
	 *                                          type: string
	 *                                          example: 'aura123123123123'
	 *                                  extension_options:
	 *                                    type: array
	 *                                  non_critical_extension_options:
	 *                                    type: array
	 *                                  memo:
	 *                                    type: string
	 *                                    example: "This is Aura Tx"
	 *                                  timeout_height:
	 *                                    type: string
	 *                                    example: "0"
	 *                              auth_info:
	 *                                type: object
	 *                                properties:
	 *                                  fee:
	 *                                    type: object
	 *                                    properties:
	 *                                      amount:
	 *                                        type: array
	 *                                        items:
	 *                                          properties:
	 *                                            denom:
	 *                                              type: string
	 *                                              example: 'uaura'
	 *                                            amount:
	 *                                              type: string
	 *                                              example: '1000000'
	 *                                      gas_limit:
	 *                                        type: string
	 *                                        example: '100000'
	 *                                      payer:
	 *                                        type: string
	 *                                        example: ''
	 *                                      granter:
	 *                                        type: string
	 *                                        example: ''
	 *                                    signer_infos:
	 *                                      type: array
	 *                                      items:
	 *                                        type: object
	 *                                        properties:
	 *                                          mode_info:
	 *                                            type: object
	 *                                            properties:
	 *                                              single:
	 *                                                type: object
	 *                                                properties:
	 *                                                  mode:
	 *                                                    type: string
	 *                                                    example: "SIGN_MODE_DIRECT"
	 *                                          public_key:
	 *                                            type: object
	 *                                            properties:
	 *                                              '@type':
	 *                                                type: string
	 *                                                example: '/cosmos.crypto.secp256k1.PubKey'
	 *                                              key:
	 *                                                type: string
	 *                                                example: 'xxxxxxxxxxxxxxxxxxxx'
	 *                                          sequence:
	 *                                            type: string
	 *                                            example: '1000000'
	 *                              signatures:
	 *                                type: array
	 *                                items:
	 *                                  type: string
	 *                                  example: 'xxxxxxxxxxxxxxx'
	 *                          tx_response:
	 *                            type: object
	 *                            properties:
	 *                              height:
	 *                                type: number
	 *                                example: 10000
	 *                              txhash:
	 *                                type: string
	 *                                example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
	 *                              codespace:
	 *                                type: string
	 *                                example: ''
	 *                              code:
	 *                                type: string
	 *                                example: '0'
	 *                              data:
	 *                                type: string
	 *                                example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
	 *                              raw_log:
	 *                                type: string
	 *                                example: '[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"xxxxx\"}]'
	 *                              logs:
	 *                                type: array
	 *                                items:
	 *                                  type: object
	 *                                  properties:
	 *                                    msg_index:
	 *                                      type: number
	 *                                      example: 0
	 *                                    log:
	 *                                      type: string
	 *                                      example: ''
	 *                                    events:
	 *                                      type: array
	 *                                      items:
	 *                                        type: object
	 *                                        properties:
	 *                                          'type':
	 *                                            type: string
	 *                                            example: 'coin_received'
	 *                                          attributes:
	 *                                            type: array
	 *                                            items:
	 *                                              type: object
	 *                                              properties:
	 *                                                key:
	 *                                                  type: string
	 *                                                  example: receiver
	 *                                                value:
	 *                                                  type: string
	 *                                                  example: 'aura123123123123123'
	 *
	 *
	 *
	 *
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
	 *                           example: "v1.transaction"
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
			address: { type: 'string', optional: true },
			addressInContract: { type: 'string', optional: true },
			pageLimit: {
				type: 'number',
				optional: true,
				default: 10,
				integer: true,
				convert: true,
				min: 1,
				max: 100,
			},
			searchType: {
				type: 'string',
				optional: true,
				default: null,
				enum: Object.values(SEARCH_TX_QUERY).map((e: ISearchTxQuery) => {
					return e.type;
				}),
			},
			searchKey: {
				type: 'string',
				optional: true,
				default: null,
				enum: Object.values(SEARCH_TX_QUERY).map((e: ISearchTxQuery) => {
					return e.key;
				}),
			},
			searchValue: {
				type: 'string',
				optional: true,
				default: null,
			},
			query: {
				type: 'string',
				optional: true,
				default: null,
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
		const address = ctx.params.address;
		const searchType = ctx.params.searchType;
		const searchKey = ctx.params.searchKey;
		const searchValue = ctx.params.searchValue;
		const queryParam = ctx.params.query;
		const addressInContract = ctx.params.addressInContract;
		let findOne = false;
		//TODO: fix slow when count in query
		// const countTotal = ctx.params.countTotal;
		// ctx.params.countTotal = false;
		// const sort = ctx.params.reverse ? '_id' : '-_id';

		const sort = '-_id';
		let query: QueryOptions = {};
		if (ctx.params.txHash) {
			ctx.params.nextKey = undefined;
			ctx.params.countTotal = false;
			ctx.params.pageOffset = 0;
			findOne = true;
		}
		if (ctx.params.nextKey) {
			query._id = { $lt: new ObjectId(ctx.params.nextKey) };
		}
		query['custom_info.chain_id'] = ctx.params.chainid;
		if (blockHeight) {
			query['tx_response.height'] = blockHeight;
		}
		if (txHash) {
			query['tx_response.txhash'] = txHash;
		}

		// if (searchType) {
		// 	query['tx_response.events.type'] = searchType;
		// }
		// if (searchKey && searchValue) {
		// 	query['tx_response.events.attributes.key'] = toBase64(toUtf8(searchKey));
		// 	query['tx_response.events.attributes.value'] = toBase64(toUtf8(searchValue));
		// }
		let listQueryAnd: any[] = [];
		let listQueryOr: any[] = [];

		if (searchType && searchKey && searchValue) {
			// query[`indexes.${searchType}_${searchKey}`] = searchValue;
			listQueryAnd.push({
				[`indexes.${searchType}_${searchKey}`]: { $exists: true, $eq: searchValue },
			});
		}

		if (queryParam) {
			let queryParamFormat = Utils.formatSearchQueryInTxSearch(ctx.params.query);
			// this.logger.info('queryParam: ', JSON.stringify(queryParamFormat));
			let queryAnd: any[] = [];
			queryParamFormat.forEach((e: any) => {
				let tempQuery = {
					[`indexes.${e.type}_${e.key}`]: { $exists: true, $eq: e.value },
				};
				// let tempQuery = {
				// 	'tx_response.events.type': e.type,
				// 	'tx_response.events.attributes.key': toBase64(toUtf8(e.key)),
				// 	'tx_response.events.attributes.value': toBase64(toUtf8(e.value)),
				// };
				// let tempQuery = {
				// 	'tx_response.events': {
				// 		$elemMatch: {
				// 			type: e.type,
				// 			attributes: {
				// 				$elemMatch: {
				// 					key: toBase64(toUtf8(e.key)),
				// 					value: toBase64(toUtf8(e.value)),
				// 				},
				// 			},
				// 		},
				// 	},
				// };
				queryAnd.push(tempQuery);
			});
			listQueryAnd.push(...queryAnd);
		}
		if (address) {
			listQueryOr.push(
				{ 'indexes.transfer_recipient': { $exists: true, $eq: address } },
				{ 'indexes.transfer_sender': { $exists: true, $eq: address } },
			);
			// listQueryAnd.push(
			// 	{ 'tx_response.events.type': 'transfer' },
			// 	{
			// 		$or: [
			// 			{ 'tx_response.events.attributes.key': BASE_64_ENCODE.RECIPIENT },
			// 			{ 'tx_response.events.attributes.key': BASE_64_ENCODE.SENDER },
			// 		],
			// 	},
			// 	{
			// 		'tx_response.events.attributes.value': toBase64(toUtf8(address)),
			// 	},
			// );
			// listQueryAnd.push({
			// 	$or: [
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'transfer',
			// 					attributes: {
			// 						$elemMatch: {
			// 							key: BASE_64_ENCODE.RECIPIENT,
			// 							value: toBase64(toUtf8(address)),
			// 						},
			// 					},
			// 				},
			// 			},
			// 		},
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'transfer',
			// 					attributes: {
			// 						$elemMatch: {
			// 							key: BASE_64_ENCODE.SENDER,
			// 							value: toBase64(toUtf8(address)),
			// 						},
			// 					},
			// 				},
			// 			},
			// 		},
			// 	],
			// });
		}
		if (addressInContract) {
			listQueryOr.push(
				{ 'indexes.wasm_sender': { $exists: true, $eq: addressInContract } },
				{ 'indexes.wasm_recipient': { $exists: true, $eq: addressInContract } },
				// { 'indexes.wasm_owner': { $exists: true, $eq: addressInContract } },
			);
		}
		if (listQueryAnd.length > 0) {
			query['$and'] = listQueryAnd;
		}

		if (listQueryOr.length > 0) {
			query['$or'] = listQueryOr;
		}
		this.logger.info('query: ', JSON.stringify(query));
		let listPromise = [];

		listPromise.push(
			this.adapter.lean({
				query: query,
				// @ts-ignore
				sort: sort,
				limit: ctx.params.pageLimit + 1,
				offset: ctx.params.pageOffset,
			}),
		);

		// find all from db
		// if (Object.keys(query).length == 1 && query['custom_info.chain_id'] != undefined) {
		// 	this.logger.debug('query all tx');
		// 	listPromise.push(
		// 		this.adapter.find({
		// 			query: query,
		// 			// @ts-ignore
		// 			sort: sort,
		// 			limit: ctx.params.pageLimit,
		// 			offset: ctx.params.pageOffset,
		// 		}),
		// 	);
		// }

		// listPromise.push(
		// 	Promise.all([...this.findTxFromLcd(ctx)]).then((array: ResponseFromRPC[]) => {
		// 		let listTxHash: any[] = [];

		// 		array.map((res: ResponseFromRPC) => {
		// 			if (res) {
		// 				listTxHash.push(
		// 					...res.result.txs.map((e: any) => {
		// 						return e.hash;
		// 					}),
		// 				);
		// 			}
		// 		});
		// 		return this.adapter.find({
		// 			query: {
		// 				'tx_response.txhash': { $in: listTxHash },
		// 			},
		// 			// @ts-ignore
		// 			sort: sort,
		// 		});
		// 	}),
		// );

		// if (ctx.params.nextKey) {
		// 	this.logger.debug('get tx from db');
		// 	if (listPromise.length == 0) {
		// 		listPromise.push(
		// 			this.adapter.find({
		// 				query: query,
		// 				// @ts-ignore
		// 				sort: sort,
		// 				limit: ctx.params.pageLimit,
		// 				offset: ctx.params.pageOffset,
		// 			}),
		// 		);
		// 	}
		// } else {
		// 	this.logger.debug('get tx hash from lcd');
		// 	listPromise.push(
		// 		Promise.all([...this.findTxFromLcd(ctx)]).then((array: ResponseFromRPC[]) => {
		// 			// this.logger.info(array);
		// 			let listTxHash: any[] = [];
		// 			array.map((res: ResponseFromRPC) => {
		// 				listTxHash.push(
		// 					...res.result.txs.map((e: any) => {
		// 						return e.hash;
		// 					}),
		// 				);
		// 			});
		// 			return this.adapter.find({
		// 				query: {
		// 					'tx_response.txhash': { $in: listTxHash },
		// 				},
		// 				// @ts-ignore
		// 				sort: sort,
		// 			});
		// 		}),
		// 	);
		// }
		try {
			// @ts-ignore
			let [result, count] = await Promise.all<TransactionEntity, TransactionEntity>([
				Promise.race(listPromise),
				//@ts-ignore
				ctx.params.countTotal === true
					? this.adapter.countWithSkipLimit({
							query: query,
							skip: 0,
							limit: ctx.params.pageLimit * 5,
					  })
					: 0,
			]);

			let nextKey = null;
			if (result.length > 0) {
				await result.forEach((tx: any) => {
					delete tx['custom_info'];
					delete tx['indexes'];
				});
				if (result.length == 1) {
					nextKey = result[result.length - 1]?._id;
				} else {
					nextKey = ctx.params.txHash ? null : result[result.length - 2]?._id;
				}
				if (result.length <= ctx.params.pageLimit) {
					nextKey = null;
				}

				if (nextKey) {
					result.pop();
				}
			}

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					transactions: result,
					count: count,
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
	 *  /v1/transaction/power-event:
	 *    get:
	 *      tags:
	 *        - Transaction
	 *      summary: Get transaction power event of validator
	 *      description: Get transaction power event of validator
	 *      parameters:
	 *        - in: query
	 *          name: chainid
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "Validator address (valoper)"
	 *        - in: query
	 *          name: pageOffset
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 0
	 *          description: "Page number, start at 0"
	 *        - in: query
	 *          name: pageLimit
	 *          required: false
	 *          schema:
	 *            type: number
	 *            default: 10
	 *          description: "number record return in a page"
	 *        - in: query
	 *          name: countTotal
	 *          required: false
	 *          schema:
	 *            type: boolean
	 *            default: "false"
	 *          description: "count total record"
	 *        - in: query
	 *          name: nextKey
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "key for next page"
	 *      responses:
	 *        '200':
	 *          description: OK
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/power-event', {
		name: 'getPowerEvent',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			address: { type: 'string', optional: false },
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
	async getPowerEvent(ctx: Context<GetPowerEventTxRequest, Record<string, unknown>>) {
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

		const address = ctx.params.address;

		const sort = '-_id';
		let query: QueryOptions = {};

		if (ctx.params.nextKey) {
			query._id = { $lt: new ObjectId(ctx.params.nextKey) };
		}
		query['custom_info.chain_id'] = ctx.params.chainid;

		let listQueryAnd: any[] = [];
		let listQueryOr: any[] = [];
		if (address) {
			// listQueryAnd.push({
			// 	$or: [
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'delegate',
			// 					'attributes.key': BASE_64_ENCODE.VALIDATOR,
			// 					'attributes.value': toBase64(toUtf8(address)),
			// 				},
			// 			},
			// 		},
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'redelegate',
			// 					'attributes.key': BASE_64_ENCODE.SOURCE_VALIDATOR,
			// 					'attributes.value': toBase64(toUtf8(address)),
			// 				},
			// 			},
			// 		},
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'redelegate',
			// 					'attributes.key': BASE_64_ENCODE.DESTINATION_VALIDATOR,
			// 					'attributes.value': toBase64(toUtf8(address)),
			// 				},
			// 			},
			// 		},
			// 		{
			// 			'tx_response.events': {
			// 				$elemMatch: {
			// 					type: 'unbond',
			// 					'attributes.key': BASE_64_ENCODE.VALIDATOR,
			// 					'attributes.value': toBase64(toUtf8(address)),
			// 				},
			// 			},
			// 		},
			// 	],
			// });
			listQueryOr.push(
				{ 'indexes.delegate_validator': { $exists: true, $eq: address } },
				{ 'indexes.redelegate_source_validator': { $exists: true, $eq: address } },
				{ 'indexes.redelegate_destination_validator': { $exists: true, $eq: address } },
				{ 'indexes.unbond_validator': { $exists: true, $eq: address } },
			);
		}

		if (listQueryAnd.length > 0) {
			query['$and'] = listQueryAnd;
		}
		if (listQueryOr.length > 0) {
			query['$or'] = listQueryOr;
		}

		this.logger.info('query: ', JSON.stringify(query));
		let listPromise = [];

		listPromise.push(
			this.adapter.lean({
				query: query,
				// @ts-ignore
				sort: sort,
				limit: ctx.params.pageLimit + 1,
				offset: ctx.params.pageOffset,
			}),
		);

		try {
			// @ts-ignore
			let [result, count] = await Promise.all<TransactionEntity, TransactionEntity>([
				Promise.race(listPromise),
				//@ts-ignore
				ctx.params.countTotal === true
					? this.adapter.countWithSkipLimit({
							query: query,
							skip: 0,
							limit: ctx.params.pageLimit * 5,
					  })
					: 0,
			]);

			let nextKey = null;
			if (result.length > 0) {
				await result.forEach((tx: any) => {
					delete tx['custom_info'];
					delete tx['indexes'];
				});

				if (result.length == 1) {
					nextKey = result[result.length - 1]?._id;
				} else {
					nextKey = result[result.length - 2]?._id;
				}
				if (result.length <= ctx.params.pageLimit) {
					nextKey = null;
				}

				if (nextKey) {
					result.pop();
				}
			}

			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					transactions: result,
					count: count,
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

	findTxFromLcd(ctx: Context<GetTxRequest, Record<string, unknown>>): any[] {
		const blockHeight = ctx.params.blockHeight;
		const txHash = ctx.params.txHash;
		const address = ctx.params.address;
		const searchType = ctx.params.searchType;
		const searchKey = ctx.params.searchKey;
		const searchValue = ctx.params.searchValue;
		const queryParam = ctx.params.query;
		const pageOffset = ctx.params.pageOffset + 1;
		const pageLimit = ctx.params.pageLimit;
		const sort = ctx.params.reverse === true ? 'asc' : 'desc';
		const url = Utils.getUrlByChainIdAndType(ctx.params.chainid, URL_TYPE_CONSTANTS.RPC);
		let listPromise = [];
		let query = [];
		if (blockHeight) {
			query.push(`tx.height=${blockHeight}`);
		}
		if (txHash) {
			query.push(`tx.hash='${txHash}'`);
		}
		if (searchKey && searchValue && searchType) {
			query.push(`${searchType}.${searchKey}='${searchValue}'`);
		}

		if (queryParam) {
			let queryParamFormat = Utils.formatSearchQueryInTxSearch(ctx.params.query);
			queryParamFormat.forEach((e: any) => {
				query.push(`${e.type}.${e.key}=${e.value}`);
			});
		}
		if (address) {
			const querySender = [...query, `transfer.sender='${address}'`];
			const queryRecipient = [...query, `transfer.recipient='${address}'`];
			this.logger.debug(
				`${Config.GET_TX_SEARCH}?query="${querySender.join(
					' AND ',
				)}"&page=${pageOffset}&per_page=${pageLimit}&order_by="${sort}"`,
			);
			this.logger.debug(
				`${Config.GET_TX_SEARCH}?query="${queryRecipient.join(
					' AND ',
				)}"&page=${pageOffset}&per_page=${pageLimit}&order_by="${sort}"`,
			);
			listPromise.push(
				this.callApiFromDomain(
					url,
					`${Config.GET_TX_SEARCH}?query="${querySender.join(
						' AND ',
					)}"&page=${pageOffset}&per_page=${pageLimit}&order_by="${sort}"`,
					0,
				),
				this.callApiFromDomain(
					url,
					`${Config.GET_TX_SEARCH}?query="${queryRecipient.join(
						' AND ',
					)}"&page=${pageOffset}&per_page=${pageLimit}&order_by="${sort}"`,
					0,
				),
			);
		} else {
			listPromise.push(
				this.callApiFromDomain(
					url,
					`${Config.GET_TX_SEARCH}?query="${query.join(
						' AND ',
					)}"&page=${pageOffset}&per_page=${pageLimit}&order_by="${sort}"`,
					0,
				),
			);
		}
		return listPromise;
	}
}
