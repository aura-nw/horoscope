/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { QueryOptions } from 'moleculer-db';
import { ObjectId } from 'mongodb';
import { fromBase64, fromUtf8, toBase64, toUtf8 } from '@cosmjs/encoding';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	GetPowerEventTxRequest,
	GetTxRequest,
	ISearchTxQuery,
	MoleculerDBService,
	ResponseDto,
} from '../../types';
import { ITransaction, TransactionEntity } from '../../entities';
import { LIST_NETWORK, MSG_TYPE, SEARCH_TX_QUERY, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { Config } from '../../common';
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
	@Get('/', {
		name: 'getByChain',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => e.chainId),
			},
			blockHeight: { type: 'number', optional: true, convert: true },
			fromHeight: { type: 'number', optional: true, convert: true },
			needFullLog: { type: 'boolean', optional: true, convert: true, default: false },
			txHash: { type: 'string', optional: true },
			address: { type: 'string', optional: true },
			addressInContract: { type: 'string', optional: true },
			sequenceIBC: { type: 'string', optional: true },
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
				enum: Object.values(SEARCH_TX_QUERY).map((e: ISearchTxQuery) => e.type),
			},
			searchKey: {
				type: 'string',
				optional: true,
				default: null,
				enum: Object.values(SEARCH_TX_QUERY).map((e: ISearchTxQuery) => e.key),
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
			queryAnd: {
				type: 'array',
				item: 'string',
				optional: true,
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
		let nextKey: any = null;
		if (ctx.params.nextKey) {
			// If (!ObjectId.isValid(ctx.params.nextKey)) {
			// 	Return (response = {
			// 		Code: ErrorCode.WRONG,
			// 		Message: ErrorMessage.VALIDATION_ERROR,
			// 		Data: {
			// 			Message: 'The nextKey is not a valid ObjectId',
			// 		},
			// 	});
			// }
			try {
				nextKey = JSON.parse(fromUtf8(fromBase64(ctx.params.nextKey)));
				// eslint-disable-next-line no-underscore-dangle
				if (!(nextKey._id && nextKey.height)) {
					throw new Error('The nextKey is not a valid next key');
				}
			} catch (error) {
				return (response = {
					code: ErrorCode.WRONG,
					message: ErrorMessage.VALIDATION_ERROR,
					data: {
						message: 'The nextKey is not a valid next key',
					},
				});
			}
		}
		const blockHeight = ctx.params.blockHeight;
		const fromHeight = ctx.params.fromHeight;
		const txHash = ctx.params.txHash;
		const address = ctx.params.address;
		const searchType = ctx.params.searchType;
		const searchKey = ctx.params.searchKey;
		const searchValue = ctx.params.searchValue;
		const queryParam = ctx.params.query;
		const queryAnd = ctx.params.queryAnd;
		const addressInContract = ctx.params.addressInContract;
		const sequenceIBC = ctx.params.sequenceIBC;
		const needFullLog = ctx.params.needFullLog;
		/* eslint-disable camelcase , no-underscore-dangle*/
		let projection: any = { indexes: 0, custom_info: 0 };

		const sort = ctx.params.reverse ? 'indexes.height' : '-indexes.height';

		// Const sort = '-indexes.height';
		const query: QueryOptions = {};
		if (ctx.params.txHash) {
			ctx.params.nextKey = undefined;
			ctx.params.countTotal = false;
			ctx.params.pageOffset = 0;
		}
		if (nextKey) {
			if (ctx.params.reverse) {
				query._id = { $gt: new ObjectId(nextKey._id) };
				query['indexes.height'] = { $gte: nextKey.height };
			} else {
				query._id = { $lt: new ObjectId(nextKey._id) };
				query['indexes.height'] = { $lte: nextKey.height };
			}
		}
		// Query['custom_info.chain_id'] = ctx.params.chainid;
		if (blockHeight) {
			query['indexes.height'] = blockHeight;
		}
		if (fromHeight) {
			query['indexes.height'] = { $gte: fromHeight };
		}
		if (txHash) {
			query['tx_response.txhash'] = txHash;
		} else {
			// Project field when get list tx
			if (!needFullLog) {
				projection.tx = 0;
				projection['tx_response.tx.body.messages'] = { $slice: 3 };
				projection['tx_response.events'] = { $slice: 3 };
				projection['tx_response.logs'] = 0;
				projection['tx_response.data'] = 0;
				projection['tx_response.raw_log'] = 0;
			}

			// Only show ibc token denom when search IBC tx
			if (sequenceIBC) {
				delete projection.indexes;
				projection = this._setProjectionForIBC(projection);
			}
		}

		const listQueryAnd: any[] = [];
		const listQueryOr: any[] = [];

		if (searchType && searchKey && searchValue) {
			listQueryAnd.push({
				[`indexes.${searchType}_${searchKey}`]: { $exists: true, $eq: searchValue },
			});
		}

		if (queryParam) {
			const queryParamFormat = Utils.formatSearchQueryInTxSearch(ctx.params.query);
			const queryAndOperator: any[] = [];
			queryParamFormat.forEach((e: any) => {
				const tempQuery = {
					[`indexes.${e.type}_${e.key}`]: {
						$exists: true,
						$eq: e.value,
					},
				};
				queryAndOperator.push(tempQuery);
			});
			listQueryAnd.push(...queryAndOperator);
		}
		if (queryAnd) {
			const queryAndOperator: any[] = [];
			queryAnd.forEach((operator: string) => {
				const keyValueList = operator.split('=');
				if (keyValueList.length === 2) {
					const value = keyValueList[1];
					let key;
					const typeKeyList = keyValueList[0].split('.');
					if (typeKeyList.length === 2) {
						key = `indexes.${typeKeyList[0]}_${typeKeyList[1]}`;
					} else if (typeKeyList.length === 1) {
						key = `indexes.${typeKeyList[0]}`;
					}

					const tempQuery = {
						[`${key}`]: {
							$exists: true,
							$eq: value,
						},
					};
					queryAndOperator.push(tempQuery);
				}
			});
			listQueryAnd.push(...queryAndOperator);
		}
		if (address) {
			listQueryOr.push({ 'indexes.addresses': { $exists: true, $eq: address } });
		}
		if (addressInContract) {
			listQueryOr.push({ 'indexes.addresses': { $exists: true, $eq: addressInContract } });
		}

		if (sequenceIBC) {
			listQueryOr.push(
				{
					'indexes.send_packet_packet_sequence': {
						$exists: true,
						$eq: sequenceIBC,
					},
				},
				{
					'indexes.recv_packet_packet_sequence': {
						$exists: true,
						$eq: sequenceIBC,
					},
				},
				{
					'indexes.acknowledge_packet_packet_sequence': {
						$exists: true,
						$eq: sequenceIBC,
					},
				},
				{
					'indexes.timeout_packet_packet_sequence': {
						$exists: true,
						$eq: sequenceIBC,
					},
				},
			);
		}
		if (listQueryAnd.length > 0) {
			query.$and = listQueryAnd;
		}

		if (listQueryOr.length > 0) {
			query.$or = listQueryOr;
		}
		this.logger.info('query: ', JSON.stringify(query));
		const listPromise = [];

		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}

		listPromise.push(
			this.adapter.lean({
				query,
				projection,
				// @ts-ignore
				sort,
				limit: ctx.params.pageLimit + 1,
				offset: ctx.params.pageOffset,
			}),
		);

		try {
			// @ts-ignore
			const [result, count] = await Promise.all<TransactionEntity, TransactionEntity>([
				Promise.race(listPromise),
				// @ts-ignore
				ctx.params.countTotal === true
					? this.adapter.countWithSkipLimit({
							query,
							skip: 0,
							limit: ctx.params.pageLimit * 5,
					  })
					: 0,
			]);

			let newNextKey = null;

			if (result.length > 0) {
				if (result.length === 1) {
					newNextKey = {
						_id: result[result.length - 1]?._id,
						height: result[result.length - 1]?.tx_response.height,
					};
				} else {
					newNextKey = ctx.params.txHash
						? null
						: {
								_id: result[result.length - 2]?._id,
								height: result[result.length - 2]?.tx_response.height,
						  };
				}
				if (result.length <= ctx.params.pageLimit) {
					newNextKey = null;
				}

				if (newNextKey) {
					result.pop();
				}
			}
			/* eslint-enable camelcase , no-underscore-dangle*/
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					transactions: result,
					count,
					nextKey: newNextKey ? toBase64(toUtf8(JSON.stringify(newNextKey))) : null,
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

	@Get('/power-event', {
		name: 'getPowerEvent',
		params: {
			chainid: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => e.chainId),
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
			if (!ObjectId.isValid(ctx.params.nextKey)) {
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

		const sort = '-indexes.height';
		const query: QueryOptions = {};
		/* eslint-disable camelcase, no-underscore-dangle, quote-props */
		if (ctx.params.nextKey) {
			query._id = { $lt: new ObjectId(ctx.params.nextKey) };
		}
		// Query['custom_info.chain_id'] = { $exists: true };

		const listQueryAnd: any[] = [];
		const listQueryOr: any[] = [];
		const projection: any = {
			indexes: 0,
			custom_info: 0,
			tx: 0,
			'tx_response.tx.body.messages': { $slice: 3 },
			'tx_response.events': 0,
			'tx_response.logs': 0,
			'tx_response.data': 0,
			'tx_response.raw_log': 0,
		};

		if (address) {
			listQueryAnd.push(
				{
					'indexes.message_module': 'staking',
				},
				{ 'indexes.addresses': address },
				// {
				// 	'indexes.message_action': {
				// 		$in: [
				// 			MSG_TYPE.MSG_DELEGATE,
				// 			MSG_TYPE.MSG_REDELEGATE,
				// 			MSG_TYPE.MSG_UNDELEGATE,
				// 		],
				// 	},
				// },
			);
		}

		if (listQueryAnd.length > 0) {
			query.$and = listQueryAnd;
		}
		if (listQueryOr.length > 0) {
			query.$or = listQueryOr;
		}

		this.logger.info('query: ', JSON.stringify(query));
		const listPromise = [];
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainid);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		listPromise.push(
			this.adapter.lean({
				query,
				projection,
				// @ts-ignore
				sort,
				limit: ctx.params.pageLimit + 1,
				offset: ctx.params.pageOffset,
			}),
		);

		try {
			// @ts-ignore
			const [result, count] = await Promise.all<TransactionEntity, TransactionEntity>([
				Promise.race(listPromise),
				ctx.params.countTotal === true
					? this.adapter.countWithSkipLimit({
							query,
							skip: 0,
							limit: ctx.params.pageLimit * 5,
					  })
					: 0,
			]);

			let nextKey = null;
			if (result.length > 0) {
				if (result.length === 1) {
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
			/* eslint-enable camelcase, no-underscore-dangle, quote-props */
			response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: {
					transactions: result,
					count,
					nextKey,
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
		const listPromise = [];
		const query = [];
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
			const queryParamFormat = Utils.formatSearchQueryInTxSearch(ctx.params.query);
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

	private _setProjectionForIBC(projection: any) {
		projection['indexes.timestamp'] = 0;
		projection['indexes.height'] = 0;
		projection['indexes.acknowledge_packet_packet_timeout_height'] = 0;
		projection['indexes.acknowledge_packet_packet_timeout_timestamp'] = 0;
		projection['indexes.acknowledge_packet_packet_sequence'] = 0;
		projection['indexes.acknowledge_packet_packet_src_port'] = 0;
		projection['indexes.acknowledge_packet_packet_src_channel'] = 0;
		projection['indexes.acknowledge_packet_packet_dst_port'] = 0;
		projection['indexes.acknowledge_packet_packet_dst_channel'] = 0;
		projection['indexes.acknowledge_packet_packet_channel_ordering'] = 0;
		projection['indexes.acknowledge_packet_packet_connection'] = 0;
		projection['indexes.fungible_token_packet_module'] = 0;
		projection['indexes.fungible_token_packet_acknowledgement'] = 0;
		projection['indexes.send_packet_packet_data'] = 0;
		projection['indexes.send_packet_packet_data_hex'] = 0;
		projection['indexes.send_packet_packet_timeout_height'] = 0;
		projection['indexes.send_packet_packet_timeout_timestamp'] = 0;
		projection['indexes.send_packet_packet_sequence'] = 0;
		projection['indexes.send_packet_packet_src_port'] = 0;
		projection['indexes.send_packet_packet_src_channel'] = 0;
		projection['indexes.send_packet_packet_dst_port'] = 0;
		projection['indexes.send_packet_packet_dst_channel'] = 0;
		projection['indexes.send_packet_packet_channel_ordering'] = 0;
		projection['indexes.send_packet_packet_connection'] = 0;
		projection['indexes.ibc_transfer_sender'] = 0;
		projection['indexes.ibc_transfer_receiver'] = 0;
		projection['indexes.coin_spent_amount'] = 0;
		projection['indexes.coin_spent_spender'] = 0;
		projection['indexes.coin_received_receiver'] = 0;
		projection['indexes.coin_received_amount'] = 0;
		projection['indexes.transfer_recipient'] = 0;
		projection['indexes.transfer_sender'] = 0;
		projection['indexes.transfer_amount'] = 0;
		projection['indexes.message_sender'] = 0;
		projection['indexes.tx_fee'] = 0;
		projection['indexes.tx_acc_seq'] = 0;
		projection['indexes.tx_signature'] = 0;
		projection['indexes.message_action'] = 0;
		projection['indexes.update_client_client_id'] = 0;
		projection['indexes.update_client_client_type'] = 0;
		projection['indexes.update_client_consensus_height'] = 0;
		projection['indexes.update_client_header'] = 0;
		projection['indexes.message_module'] = 0;
		projection['indexes.recv_packet_packet_data'] = 0;
		projection['indexes.recv_packet_packet_data_hex'] = 0;
		projection['indexes.recv_packet_packet_timeout_height'] = 0;
		projection['indexes.recv_packet_packet_timeout_timestamp'] = 0;
		projection['indexes.recv_packet_packet_sequence'] = 0;
		projection['indexes.recv_packet_packet_src_port'] = 0;
		projection['indexes.recv_packet_packet_src_channel'] = 0;
		projection['indexes.recv_packet_packet_dst_port'] = 0;
		projection['indexes.recv_packet_packet_dst_channel'] = 0;
		projection['indexes.recv_packet_packet_channel_ordering'] = 0;
		projection['indexes.recv_packet_packet_connection'] = 0;
		projection['indexes.denomination_trace_trace_hash'] = 0;
		projection['indexes.coinbase_minter'] = 0;
		projection['indexes.fungible_token_packet_receiver'] = 0;
		projection['indexes.fungible_token_packet_denom'] = 0;
		projection['indexes.fungible_token_packet_amount'] = 0;
		projection['indexes.write_acknowledgement_packet_data'] = 0;
		projection['indexes.write_acknowledgement_packet_data_hex'] = 0;
		projection['indexes.write_acknowledgement_packet_timeout_height'] = 0;
		projection['indexes.write_acknowledgement_packet_timeout_timestamp'] = 0;
		projection['indexes.write_acknowledgement_packet_sequence'] = 0;
		projection['indexes.write_acknowledgement_packet_src_port'] = 0;
		projection['indexes.write_acknowledgement_packet_src_channel'] = 0;
		projection['indexes.write_acknowledgement_packet_dst_port'] = 0;
		projection['indexes.write_acknowledgement_packet_dst_channel'] = 0;
		projection['indexes.write_acknowledgement_packet_ack'] = 0;
		projection['indexes.write_acknowledgement_packet_ack_hex'] = 0;
		projection['indexes.write_acknowledgement_packet_connection'] = 0;
		return projection;
	}

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
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
	 *        - in: query
	 *          name: blockHeight
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Block height of transaction"
	 *        - in: query
	 *          name: fromHeight
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Tx from block height"
	 *        - in: query
	 *          name: needFullLog
	 *          required: false
	 *          schema:
	 *            type: boolean
	 *            default: "false"
	 *          description: "Get full log tx"
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
	 *          description: "Address in transaction"
	 *        - in: query
	 *          name: addressInContract
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Address in transaction with token from smart contract"
	 *          deprecated: true
	 *        - in: query
	 *          name: sequenceIBC
	 *          required: false
	 *          schema:
	 *            type: string
	 *          description: "Sequence IBC in IBC transaction"
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
	 *          deprecated: true
	 *        - in: query
	 *          name: queryAnd[]
	 *          required: false
	 *          schema:
	 *            type: array
	 *            items:
	 *              type: string
	 *          description: "Search query with format A.B=C"
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
	 *                                    items:
	 *                                      type: object
	 *                                  non_critical_extension_options:
	 *                                    type: array
	 *                                    items:
	 *                                      type: object
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
	 *                                  signer_infos:
	 *                                    type: array
	 *                                    items:
	 *                                      type: object
	 *                                      properties:
	 *                                        mode_info:
	 *                                          type: object
	 *                                          properties:
	 *                                            single:
	 *                                              type: object
	 *                                              properties:
	 *                                                mode:
	 *                                                  type: string
	 *                                                  example: "SIGN_MODE_DIRECT"
	 *                                        public_key:
	 *                                          type: object
	 *                                          properties:
	 *                                            '@type':
	 *                                              type: string
	 *                                              example: '/cosmos.crypto.secp256k1.PubKey'
	 *                                            key:
	 *                                              type: string
	 *                                              example: 'xxxxxxxxxxxxxxxxxxxx'
	 *                                        sequence:
	 *                                          type: string
	 *                                          example: '1000000'
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
	 *                              info:
	 *                                type: string
	 *                              gas_wanted:
	 *                                type: string
	 *                                example: "200000"
	 *                              gas_used:
	 *                                type: string
	 *                                example: "150000"
	 *                              tx:
	 *                                type: object
	 *                                properties:
	 *                                  '@type':
	 *                                    type: string
	 *                                    example: '/cosmos.tx.v1beta1.Tx'
	 *                                  body:
	 *                                    type: object
	 *                                    properties:
	 *                                      messages:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                          properties:
	 *                                            '@type':
	 *                                              type: string
	 *                                              example: '/cosmos.staking.v1beta1.MsgDelegate'
	 *                                            delegator_address:
	 *                                              type: string
	 *                                              example: 'aura123123123123123'
	 *                                            validator_address:
	 *                                              type: string
	 *                                              example: 'aura123123123123123123'
	 *                                      memo:
	 *                                        type: string
	 *                                      timeout_height:
	 *                                        type: string
	 *                                        example: '0'
	 *                                      extension_options:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                      non_critical_extension_options:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                  auth_info:
	 *                                    type: object
	 *                                    properties:
	 *                                      fee:
	 *                                        type: object
	 *                                        properties:
	 *                                          amount:
	 *                                            type: array
	 *                                            items:
	 *                                              properties:
	 *                                                denom:
	 *                                                  type: string
	 *                                                  example: 'uaura'
	 *                                                amount:
	 *                                                  type: string
	 *                                                  example: '1000000'
	 *                                          gas_limit:
	 *                                            type: string
	 *                                            example: '100000'
	 *                                          payer:
	 *                                            type: string
	 *                                            example: ''
	 *                                          granter:
	 *                                            type: string
	 *                                            example: ''
	 *                                      signer_infos:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                          properties:
	 *                                            mode_info:
	 *                                              type: object
	 *                                              properties:
	 *                                                single:
	 *                                                  type: object
	 *                                                  properties:
	 *                                                    mode:
	 *                                                      type: string
	 *                                                      example: "SIGN_MODE_DIRECT"
	 *                                            public_key:
	 *                                              type: object
	 *                                              properties:
	 *                                                '@type':
	 *                                                  type: string
	 *                                                  example: '/cosmos.crypto.secp256k1.PubKey'
	 *                                                key:
	 *                                                  type: string
	 *                                                  example: 'xxxxxxxxxxxxxxxxxxxx'
	 *                                            sequence:
	 *                                              type: string
	 *                                              example: '1000000'
	 *                                  signatures:
	 *                                    type: array
	 *                                    items:
	 *                                      type: string
	 *                                      example: 'xxxxxxxxxxxxxxx'
	 *                              timestamp:
	 *                                type: string
	 *                                example: '2022-09-13T03:17:45.000Z'
	 *                              events:
	 *                                type: array
	 *                                items:
	 *                                  type: object
	 *                                  properties:
	 *                                    'type':
	 *                                      type: string
	 *                                      example: 'coin_received'
	 *                                    attributes:
	 *                                      type: array
	 *                                      items:
	 *                                        properties:
	 *                                          key:
	 *                                            type: string
	 *                                            example: 'c3BlbmRlcg=='
	 *                                          value:
	 *                                            type: string
	 *                                            example: 'xxxxxxxxxxxxxxxxxxxxxx'
	 *                      count:
	 *                        type: number
	 *                        example: 10
	 *                      nextKey:
	 *                        type: string
	 *                        example: 'abc'
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
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
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
	 *                                    items:
	 *                                      type: object
	 *                                  non_critical_extension_options:
	 *                                    type: array
	 *                                    items:
	 *                                      type: object
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
	 *                                  signer_infos:
	 *                                    type: array
	 *                                    items:
	 *                                      type: object
	 *                                      properties:
	 *                                        mode_info:
	 *                                          type: object
	 *                                          properties:
	 *                                            single:
	 *                                              type: object
	 *                                              properties:
	 *                                                mode:
	 *                                                  type: string
	 *                                                  example: "SIGN_MODE_DIRECT"
	 *                                        public_key:
	 *                                          type: object
	 *                                          properties:
	 *                                            '@type':
	 *                                              type: string
	 *                                              example: '/cosmos.crypto.secp256k1.PubKey'
	 *                                            key:
	 *                                              type: string
	 *                                              example: 'xxxxxxxxxxxxxxxxxxxx'
	 *                                        sequence:
	 *                                          type: string
	 *                                          example: '1000000'
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
	 *                              info:
	 *                                type: string
	 *                              gas_wanted:
	 *                                type: string
	 *                                example: "200000"
	 *                              gas_used:
	 *                                type: string
	 *                                example: "150000"
	 *                              tx:
	 *                                type: object
	 *                                properties:
	 *                                  '@type':
	 *                                    type: string
	 *                                    example: '/cosmos.tx.v1beta1.Tx'
	 *                                  body:
	 *                                    type: object
	 *                                    properties:
	 *                                      messages:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                          properties:
	 *                                            '@type':
	 *                                              type: string
	 *                                              example: '/cosmos.staking.v1beta1.MsgDelegate'
	 *                                            delegator_address:
	 *                                              type: string
	 *                                              example: 'aura123123123123123'
	 *                                            validator_address:
	 *                                              type: string
	 *                                              example: 'aura123123123123123123'
	 *                                      memo:
	 *                                        type: string
	 *                                      timeout_height:
	 *                                        type: string
	 *                                        example: '0'
	 *                                      extension_options:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                      non_critical_extension_options:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                  auth_info:
	 *                                    type: object
	 *                                    properties:
	 *                                      fee:
	 *                                        type: object
	 *                                        properties:
	 *                                          amount:
	 *                                            type: array
	 *                                            items:
	 *                                              properties:
	 *                                                denom:
	 *                                                  type: string
	 *                                                  example: 'uaura'
	 *                                                amount:
	 *                                                  type: string
	 *                                                  example: '1000000'
	 *                                          gas_limit:
	 *                                            type: string
	 *                                            example: '100000'
	 *                                          payer:
	 *                                            type: string
	 *                                            example: ''
	 *                                          granter:
	 *                                            type: string
	 *                                            example: ''
	 *                                      signer_infos:
	 *                                        type: array
	 *                                        items:
	 *                                          type: object
	 *                                          properties:
	 *                                            mode_info:
	 *                                              type: object
	 *                                              properties:
	 *                                                single:
	 *                                                  type: object
	 *                                                  properties:
	 *                                                    mode:
	 *                                                      type: string
	 *                                                      example: "SIGN_MODE_DIRECT"
	 *                                            public_key:
	 *                                              type: object
	 *                                              properties:
	 *                                                '@type':
	 *                                                  type: string
	 *                                                  example: '/cosmos.crypto.secp256k1.PubKey'
	 *                                                key:
	 *                                                  type: string
	 *                                                  example: 'xxxxxxxxxxxxxxxxxxxx'
	 *                                            sequence:
	 *                                              type: string
	 *                                              example: '1000000'
	 *                                  signatures:
	 *                                    type: array
	 *                                    items:
	 *                                      type: string
	 *                                      example: 'xxxxxxxxxxxxxxx'
	 *                              timestamp:
	 *                                type: string
	 *                                example: '2022-09-13T03:17:45.000Z'
	 *                              events:
	 *                                type: array
	 *                                items:
	 *                                  type: object
	 *                                  properties:
	 *                                    'type':
	 *                                      type: string
	 *                                      example: 'coin_received'
	 *                                    attributes:
	 *                                      type: array
	 *                                      items:
	 *                                        properties:
	 *                                          key:
	 *                                            type: string
	 *                                            example: 'c3BlbmRlcg=='
	 *                                          value:
	 *                                            type: string
	 *                                            example: 'xxxxxxxxxxxxxxxxxxxxxx'
	 *                      count:
	 *                        type: number
	 *                        example: 10
	 *                      nextKey:
	 *                        type: string
	 *                        example: 'abc'
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
}
