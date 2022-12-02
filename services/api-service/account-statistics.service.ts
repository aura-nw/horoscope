/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountStatisticsMixin } from '../../mixins/dbMixinMongoose';
import {
	ErrorCode,
	ErrorMessage,
	MoleculerDBService,
	TopAccountsRequest,
} from '../../types';
import { IAccountStatistics } from '../../entities';
import { LIST_NETWORK, TOP_ACCOUNT_STATS_FIELD } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-statistics',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountStatisticsMixin],
	/**
	 * Settings
	 */
})
export default class AccountStatisticsService extends MoleculerDBService<
	{
		rest: 'v1/account-statistics';
	},
	IAccountStatistics
> {
	@Get('/', {
		name: 'getTopAccounts',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			chainId: 'string',
			dayRange: { type: 'number', convert: true },
			limit: { type: 'number', convert: true },
		},
	})
	async getTopAccounts(ctx: Context<TopAccountsRequest>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		const network = LIST_NETWORK.find((x) => x.chainId == params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}

		let day_range: string = '';
		switch (params.dayRange) {
			case 1:
				day_range = 'one_day';
				break;
			case 3:
				day_range = 'three_days';
				break;
			case 7:
				day_range = 'seven_days';
				break;
		}

		let projectionTxSent: any = {}, projectionTxReceived: any = {},
			projectionAmountSent: any = {}, projectionAmountReceived: any = {};
		projectionTxSent.address = 1;
		projectionTxSent[`${day_range}.total_sent_tx`] = 1;
		projectionTxReceived.address = 1;
		projectionTxReceived[`${day_range}.total_received_tx`] = 1;
		projectionAmountSent.address = 1;
		projectionAmountSent[`${day_range}.total_sent_amount`] = 1;
		projectionAmountReceived.address = 1;
		projectionAmountReceived[`${day_range}.total_received_amount`] = 1;
		let [dataTxSent, dataTxReceived, dataAmountSent, dataAmountReceived] = await Promise.all([
			this.adapter.lean({
				projection: projectionTxSent,
				sort: `-${day_range}.total_sent_tx.percentage -${day_range}.total_sent_amount.percentage`,
				limit: params.limit,
			}),
			this.adapter.lean({
				projection: projectionTxReceived,
				sort: `-${day_range}.total_received_tx.percentage -${day_range}.total_received_amount.percentage`,
				limit: params.limit,
			}),
			this.adapter.lean({
				projection: projectionAmountSent,
				sort: `-${day_range}.total_sent_amount.percentage -${day_range}.total_sent_tx.percentage`,
				limit: params.limit,
			}),
			this.adapter.lean({
				projection: projectionAmountReceived,
				sort: `-${day_range}.total_received_amount.percentage -${day_range}.total_received_tx.percentage`,
				limit: params.limit,
			}),
		]);
		return {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				top_aura_senders: dataTxSent,
				top_aura_receivers: dataTxReceived,
				top_txn_count_sent: dataAmountSent,
				top_txn_count_received: dataAmountReceived,
			},
		};
	}

	/**
	 *  @swagger
	 *  /v1/account-statistics:
	 *    get:
	 *      tags:
	 *        - AuraScan Statistics
	 *      summary: Get top accounts data
	 *      description: Get top accounts data
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
	 *          name: dayRange
	 *          required: true
	 *          schema:
	 *            type: number
	 *            enum: ["1","3","7"]
	 *          description: "Day limit to query"
	 *        - in: query
	 *          name: limit
	 *          required: true
	 *          schema:
	 *            type: number
	 *            enum: ["1","5","10","15","20"]
	 *          description: "Number of records returned"
	 *      responses:
	 *        '200':
	 *          description: Top Statistics
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
	 *                    type: array
	 *                    items:
	 *                      type: object
	 *                      properties:
	 *                        address:
	 *                          type: string
	 *                          example: aura1s9z065kv897was45gel6wxjcddu73fmh4qwmcu
	 *                        per_day:
	 *                          type: array
	 *                          items:
	 *                            type: object
	 *                            properties:
	 *                              total_sent_tx:
	 *                                type: object
	 *                                properties:
	 *                                  amount:
	 *                                    type: number
	 *                                    example: 100
	 *                                  percentage:
	 *                                    type: number
	 *                                    example: 30.45
	 *                              total_received_tx:
	 *                                type: object
	 *                                properties:
	 *                                  amount:
	 *                                    type: number
	 *                                    example: 100
	 *                                  percentage:
	 *                                    type: number
	 *                                    example: 30.45
	 *                              total_sent_amount:
	 *                                type: object
	 *                                properties:
	 *                                  amount:
	 *                                    type: number
	 *                                    example: 100
	 *                                  percentage:
	 *                                    type: number
	 *                                    example: 30.45
	 *                              total_received_amount:
	 *                                type: object
	 *                                properties:
	 *                                  amount:
	 *                                    type: number
	 *                                    example: 100
	 *                                  percentage:
	 *                                    type: number
	 *                                    example: 30.45
	 *                        one_day:
	 *                          type: object
	 *                          properties:
	 *                            total_sent_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_sent_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                        three_days:
	 *                          type: object
	 *                          properties:
	 *                            total_sent_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_sent_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                        seven_days:
	 *                          type: object
	 *                          properties:
	 *                            total_sent_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_tx:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_sent_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
	 *                            total_received_amount:
	 *                              type: object
	 *                              properties:
	 *                                amount:
	 *                                  type: number
	 *                                  example: 100
	 *                                percentage:
	 *                                  type: number
	 *                                  example: 30.45
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
