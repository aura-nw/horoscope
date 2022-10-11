/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { BlockchainDataRequest, getActionConfig, MoleculerDBService, RestOptions, TopAccountsRequest } from '../../types';
import { IDailyTxStatistics, IInflation } from '../../entities';
import { DbContextParameters } from 'moleculer-db';
import { LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'daily-tx-statistics',
    version: 1,
    /**
     * Mixins
     */
    mixins: [dbDailyTxStatisticsMixin],
    /**
     * Settings
     */
})
export default class DailyTxStatisticsService extends MoleculerDBService<
    {
        rest: 'v1/daily-tx-statistics';
    },
    IDailyTxStatistics
> {
    /**
     *  @swagger
     *  /v1/statistics/blockchain-data:
     *    get:
     *      tags:
     *        - AuraScan Statistics
     *      summary: Get daily blockchain data
     *      description: Get daily blockchain data
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
     *          name: limit
     *          required: true
     *          schema:
     *            type: number
     *          description: "Number of records returned"
     *      responses:
     *        '200':
     *          description: Daily Blockchain Data
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
     *                      daily_txs:
     *                        type: number
     *                        example: 100
     *                      daily_active_addresses:
     *                        type: number
     *                        example: 100
     *                      unique_addresses:
     *                        type: number
     *                        example: 100
     *                      date:
     *                        type: string
     *                        example: 2022-10-05T00:00:00.000+00:00
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
        name: 'getDailyData',
        /**
         * Service guard services allowed to connect
         */
        restricted: ['api'],
        params: {
            chainId: 'string',
            limit: 'number',
        },
    })
    async getDailyData(ctx: Context<BlockchainDataRequest>) {
        const params = await this.sanitizeParams(ctx, ctx.params);
        const network = LIST_NETWORK.find((x) => x.chainId == params.chainId);
        if (network && network.databaseName) {
            this.adapter.useDb(network.databaseName);
        }
        let result = await this.adapter.lean({
            sort: '-date',
            limit: params.limit,
        });
        return result;
    }
}