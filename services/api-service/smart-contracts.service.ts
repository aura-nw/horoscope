/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { ObjectId } from 'mongodb';
import { ErrorCode, ErrorMessage, GetContractsRequest, MoleculerDBService } from '../../types';
import { LIST_NETWORK } from '../../common/constant';
import { dbSmartContractsMixin } from '../../mixins/dbMixinMongoose';
import { _callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { ISmartContracts } from '../../model/smart-contracts.model';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'smart-contracts',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [_callApiMixin, dbSmartContractsMixin],
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
			height: {
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
		const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		let query: any = {};
		if (ctx.params.height && ctx.params.height !== 0) {
			query = { height: ctx.params.height };
		} else if (ctx.params.contract_addresses && ctx.params.contract_addresses.length > 0) {
			query = { contract_address: { $in: ctx.params.contract_addresses } };
		}
		if (ctx.params.nextKey && ctx.params.nextKey !== '') {
			query._id = { $gte: new ObjectId(ctx.params.nextKey) };
		}
		this.logger.info('query', query);
		const data: any = await this.adapter.find({
			query,
			// @ts-ignore
			sort: '_id',
			limit: ctx.params.limit + 1,
		});
		const next_key =
			data.length === ctx.params.limit + 1 ? data[ctx.params.limit - 1]._id : null;
		const response = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				smart_contracts: data.slice(0, ctx.params.limit - 1),
				next_key,
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
	 *          name: height
	 *          schema:
	 *            type: number
	 *          description: "Smart contract creation block height"
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
