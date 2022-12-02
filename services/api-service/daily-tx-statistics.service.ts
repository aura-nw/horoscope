/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { BlockchainDataRequest, ErrorCode, ErrorMessage, MoleculerDBService } from '../../types';
import { IDailyTxStatistics } from '../../entities';
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
	@Get('/', {
		name: 'getDailyData',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			chainId: 'string',
			limit: { type: 'number', convert: true },
		},
	})
	async getDailyData(ctx: Context<BlockchainDataRequest>) {
		const params = await this.sanitizeParams(ctx, ctx.params);
		const network = LIST_NETWORK.find((x) => x.chainId == params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		let limit = 365;
		let result: IDailyTxStatistics[] = await this.adapter.lean({
			sort: '-date',
			limit,
		});
		let extremeData = {
			daily_txs: {
				max: {
					amount: result[0].daily_txs,
					date: result[0].date,
				},
				min: {
					amount: result[0].daily_txs,
					date: result[0].date,
				},
			},
			unique_addresses: {
				max_gap: {
					amount: result[0].unique_addresses_increase,
					date: result[0].date,
				},
				min_gap: {
					amount: result[0].unique_addresses_increase,
					date: result[0].date,
				},
			},
		};
		for (let res of result) {
			if (res.daily_txs > extremeData.daily_txs.max.amount) {
				extremeData.daily_txs.max.amount = res.daily_txs;
				extremeData.daily_txs.max.date = res.date;
			}
			if (res.daily_txs < extremeData.daily_txs.min.amount) {
				extremeData.daily_txs.min.amount = res.daily_txs;
				extremeData.daily_txs.min.date = res.date;
			}
			if (res.unique_addresses_increase > extremeData.unique_addresses.max_gap.amount) {
				extremeData.unique_addresses.max_gap.amount = res.unique_addresses_increase;
				extremeData.unique_addresses.max_gap.date = res.date;
			}
			if (res.unique_addresses_increase < extremeData.unique_addresses.min_gap.amount) {
				extremeData.unique_addresses.min_gap.amount = res.unique_addresses_increase;
				extremeData.unique_addresses.min_gap.date = res.date;
			}
		}
		return {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				dailyData: result.slice(0, params.limit),
				extremeData,
			},
		};
	}
	/**
	 *  @swagger
	 *  /v1/daily-tx-statistics:
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
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet-2"
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
	 *                      unique_addresses_increase:
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
}
