/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { ObjectId } from 'mongodb';
import { ErrorCode, ErrorMessage, GetContractsRequest, MoleculerDBService } from '../../types';
import { CODEID_MANAGER_ACTION, LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { dbSmartContractsMixin } from '../../mixins/dbMixinMongoose';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { ISmartContracts } from '../../model/smart-contracts.model';
import { Utils } from '../../utils/utils';
import { Config } from '../../common';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'smart-contracts',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [callApiMixin, dbSmartContractsMixin],
	/**
	 * Settings
	 */
})
export default class SmartContractsService extends MoleculerDBService<
	{
		rest: 'v1/smart-contracts';
	},
	ISmartContracts
> {
	@Get('/', {
		name: 'getContracts',
		params: {
			chainId: 'string',
			fromHeight: {
				type: 'number',
				interger: true,
				convert: true,
				optional: true,
			},
			toHeight: {
				type: 'number',
				interger: true,
				convert: true,
				optional: true,
			},
			contract_addresses: {
				type: 'array',
				items: 'string',
				optional: true,
			},
			limit: {
				type: 'number',
				default: 10,
				integer: true,
				convert: true,
				min: 1,
				max: 100,
			},
			nextKey: {
				type: 'string',
				optional: true,
			},
		},
	})
	async getContracts(ctx: Context<GetContractsRequest>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		let query: any = {};
		if (ctx.params.fromHeight && ctx.params.fromHeight !== 0) {
			query = { height: { $gte: ctx.params.fromHeight } };
			if (ctx.params.toHeight && ctx.params.toHeight !== 0) {
				query.height.$lte = ctx.params.toHeight;
			}
		} else if (ctx.params.contract_addresses && ctx.params.contract_addresses.length > 0) {
			query = { contract_address: { $in: ctx.params.contract_addresses } };
		}
		if (ctx.params.nextKey && ctx.params.nextKey !== '') {
			// eslint-disable-next-line no-underscore-dangle
			query._id = { $gte: new ObjectId(ctx.params.nextKey) };
		}
		this.logger.info('query', query);
		let data: any = await this.adapter.find({
			query,
			// @ts-ignore
			sort: '-_id',
			limit: ctx.params.limit + 1,
		});
		const listAssetQueries: any = [];
		const listCodeIdCreators: any = [];
		const url = Utils.getUrlByChainIdAndType(ctx.params.chainId, URL_TYPE_CONSTANTS.LCD);
		data = data.map((d: any) => {
			d = d.toObject();
			const param = `${Config.GET_DATA_HASH}${d.code_id}`;
			listAssetQueries.push(
				this.broker.call(CODEID_MANAGER_ACTION.CHECK_STATUS, {
					chain_id: ctx.params.chainId,
					code_id: d.code_id,
				}),
			);
			listCodeIdCreators.push(this.callApiFromDomain(url, param));
			return d;
		});
		const [resultAsset, resultCreator] = await Promise.all([
			Promise.all(listAssetQueries),
			Promise.all(listCodeIdCreators),
		]);
		resultAsset.map((ra: any, index: number) => {
			data[index].contract_type = {
				status: ra.status,
				type: ra.contractType,
				creator: resultCreator.find(
					(rc: any) => Number(rc.code_info.code_id) === data[index].code_id,
				).code_info.creator,
			};
		});

		const nextKey =
			// eslint-disable-next-line no-underscore-dangle
			data.length === ctx.params.limit + 1 ? data[ctx.params.limit - 1]._id : null;
		const response = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				smart_contracts: data.slice(0, ctx.params.limit),
				next_key: nextKey,
			},
		};
		return response;
	}
	/**
	 *  @swagger
	 *  /v1/smart-contracts:
	 *    get:
	 *      tags:
	 *        - Smart Contracts
	 *      summary: Get synced smart contracts
	 *      description: Get synced smart contracts
	 *      parameters:
	 *        - in: query
	 *          name: chainId
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
	 *        - in: query
	 *          name: fromHeight
	 *          schema:
	 *            type: number
	 *          description: "Smart contract creation from block height"
	 *        - in: query
	 *          name: toHeight
	 *          schema:
	 *            type: number
	 *          description: "Smart contract creation to block height"
	 *        - in: query
	 *          name: contract_addresses[]
	 *          schema:
	 *            type: array
	 *            items:
	 *              type: string
	 *          description: "Smart contract address"
	 *        - in: query
	 *          name: limit
	 *          required: true
	 *          schema:
	 *            type: number
	 *          description: "Number of records returned"
	 *          example: 10
	 *        - in: query
	 *          name: nextKey
	 *          schema:
	 *            type: string
	 *          description: "Next key to query"
	 *      responses:
	 *        '200':
	 *          description: Smart contracts
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
	 *                      smart-contracts:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            height:
	 *                              type: number
	 *                              example: 3243718
	 *                            code_id:
	 *                              type: number
	 *                              example: 19
	 *                            contract_name:
	 *                              type: string
	 *                              example: 'Flex'
	 *                            contract_address:
	 *                              type: string
	 *                              example: 'auracdxq3eq341wfew3rwg45rgevst5e452grw3rg3'
	 *                            creator_address:
	 *                              type: string
	 *                              example: 'auracdxq3eq341wfew3rwg45rgevst5e452grw3rg3'
	 *                            contract_hash:
	 *                              type: string
	 *                              example: 'DNFSIL323J298JW01JHFUH9Q8JA39W9J92H32FJF04EJF3084JRG30HE820J'
	 *                            tx_hash:
	 *                              type: string
	 *                              example: 'CSERNFVIQLN24E78DSHEU7I6QGSUHUG176G2W71T349YWS2HDB827YG3WF8Y'
	 *                      next_key:
	 *                        type: string
	 *                        example: '6332a5b8b0257f00177afebb'
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
	 *                           example: "v1.account-info"
	 */
}
