/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAccountStatisticsMixin, dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { BlockchainDataRequest, ErrorCode, ErrorMessage, getActionConfig, MoleculerDBService, RestOptions, TopAccountsRequest } from '../../types';
import { IAccountStatistics, IDailyTxStatistics, IInflation } from '../../entities';
import { DbContextParameters } from 'moleculer-db';
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
     *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
     *          description: "Chain Id of network need to query"
     *          example: "aura-testnet"
     *        - in: query
     *          name: field
     *          required: true
     *          schema:
     *            type: string
     *            enum: ["TXS_SENT","TXS_RECEIVED","AMOUNT_SENT","AMOUNT_RECEIVED"]
     *          description: "Account's field to query"
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
     @Get('/', {
        name: 'getTopAccounts',
        /**
         * Service guard services allowed to connect
         */
        restricted: ['api'],
        params: {
            chainId: 'string',
            field: 'string',
            dayRange: 'string',
            limit: { type: 'number', convert: true },
        },
    })
    async getTopAccounts(ctx: Context<TopAccountsRequest>) {
        const params = await this.sanitizeParams(ctx, ctx.params);
        // const network = LIST_NETWORK.find((x) => x.chainId == params.chainId);
        // if (network && network.databaseName) {
        //     this.adapter.useDb(network.databaseName);
        // }
        
        let sort, day_range;
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
        switch (params.field) {
            case TOP_ACCOUNT_STATS_FIELD.TXS_SENT:
                sort = `-${day_range}.total_sent_tx.percentage -${day_range}.total_sent_amount.percentage`;
                break;
            case TOP_ACCOUNT_STATS_FIELD.TXS_RECEIVED:
                sort = `-${day_range}.total_received_tx.percentage -${day_range}.total_received_amount.percentage`;
                break;
            case TOP_ACCOUNT_STATS_FIELD.AMOUNT_SENT:
                sort = `-${day_range}.total_sent_amount.percentage -${day_range}.total_sent_tx.percentage`;
                break;
            case TOP_ACCOUNT_STATS_FIELD.AMOUNT_RECEIVED:
                sort = `-${day_range}.total_received_amount.percentage -${day_range}.total_received_tx.percentage`;
                break;
        }

        let data = await this.adapter.lean({
            sort,
            limit: params.limit,
        });
        return {
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data,
        };
    }
}