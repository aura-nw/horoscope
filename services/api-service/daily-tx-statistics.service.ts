/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { BlockchainDataRequest, ErrorCode, ErrorMessage, MoleculerDBService } from '../../types';
import { IDailyTxStatistics } from '../../entities';
import { BLOCKCHAIN_DATA, LIST_NETWORK } from '../../common/constant';

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
			property: {
				type: 'string',
				optional: true,
				enum: Object.values(BLOCKCHAIN_DATA),
			},
			startDate: { type: 'number', convert: true },
			endDate: {
				type: 'number',
				optional: true,
				convert: true,
			},
		},
	})
	async getDailyData(ctx: Context<BlockchainDataRequest>) {
		const startDate = Math.floor(ctx.params.startDate / 100000) * 100000;
		const endDate = ctx.params.endDate ? Math.floor(ctx.params.endDate / 100000) * 100000 : 0;

		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}

		const projection: any = [{ $sort: { date: 1 } }, { $limit: 365 }];
		switch (ctx.params.property) {
			case BLOCKCHAIN_DATA.DAILY_TXS:
				projection.push(
					...[{ $project: { daily_txs: 1, date: 1 } }, { $unwind: '$daily_txs' }],
				);
				break;
			case BLOCKCHAIN_DATA.DAILY_ACTIVE_ADDRESSES:
				projection.push(
					...[
						{ $project: { daily_active_addresses: 1, date: 1 } },
						{ $unwind: '$daily_active_addresses' },
					],
				);
				break;
			case BLOCKCHAIN_DATA.UNIQUE_ADDRESSES:
				projection.push(
					...[
						{
							$project: {
								unique_addresses: 1,
								unique_addresses_increase: 1,
								date: 1,
							},
						},
						{ $unwind: '$unique_addresses' },
					],
				);
				break;
		}
		const result: IDailyTxStatistics[] = await this.adapter.aggregate(projection);
		let extremeData: any = {};
		switch (ctx.params.property) {
			case BLOCKCHAIN_DATA.DAILY_TXS:
				extremeData = {
					max: {
						amount: result[0].daily_txs,
						date: result[0].date,
					},
					min: {
						amount: result[0].daily_txs,
						date: result[0].date,
					},
				};
				for (const res of result) {
					if (res.daily_txs > extremeData.max.amount) {
						extremeData.max.amount = res.daily_txs;
						extremeData.max.date = res.date;
					}
					if (res.daily_txs < extremeData.min.amount) {
						extremeData.min.amount = res.daily_txs;
						extremeData.min.date = res.date;
					}
				}
				break;
			case BLOCKCHAIN_DATA.DAILY_ACTIVE_ADDRESSES:
				extremeData = {
					max: {
						amount: result[0].daily_active_addresses,
						date: result[0].date,
					},
					min: {
						amount: result[0].daily_active_addresses,
						date: result[0].date,
					},
				};
				for (const res of result) {
					if (res.daily_active_addresses > extremeData.max.amount) {
						extremeData.max.amount = res.daily_active_addresses;
						extremeData.max.date = res.date;
					}
					if (res.daily_active_addresses < extremeData.min.amount) {
						extremeData.min.amount = res.daily_active_addresses;
						extremeData.min.date = res.date;
					}
				}
				break;
			case BLOCKCHAIN_DATA.UNIQUE_ADDRESSES:
				extremeData = {
					max: {
						amount: result[0].unique_addresses_increase,
						date: result[0].date,
					},
					min: {
						amount: result[0].unique_addresses_increase,
						date: result[0].date,
					},
				};
				for (const res of result) {
					if (res.unique_addresses_increase > extremeData.max.amount) {
						extremeData.max.amount = res.unique_addresses_increase;
						extremeData.max.date = res.date;
					}
					if (res.unique_addresses_increase < extremeData.min.amount) {
						extremeData.min.amount = res.unique_addresses_increase;
						extremeData.min.date = res.date;
					}
				}
				break;
		}

		return {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data: {
				dailyData: result.filter((res: any) =>
					ctx.params.endDate
						? res.date.getTime() >= startDate && res.date.getTime() <= endDate
						: res.date.getTime() >= startDate,
				),
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
	 *          name: property
	 *          schema:
	 *            type: string
	 *            enum: ["daily_txs","daily_active_addresses","unique_addresses"]
	 *          description: "Property of Blockchain Data to query"
	 *          example: "daily_txs"
	 *        - in: query
	 *          name: startDate
	 *          required: true
	 *          schema:
	 *            type: number
	 *          description: "Start date to query data in timestamp"
	 *        - in: query
	 *          name: endDate
	 *          schema:
	 *            type: number
	 *          description: "End date to query data in timestamp"
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
	 *                      dailyData:
	 *                        type: object
	 *                        properties:
	 *                          daily_txs:
	 *                            type: number
	 *                            example: 100
	 *                          daily_active_addresses:
	 *                            type: number
	 *                            example: 100
	 *                          unique_addresses:
	 *                            type: number
	 *                            example: 100
	 *                          unique_addresses_increase:
	 *                            type: number
	 *                            example: 100
	 *                          date:
	 *                            type: string
	 *                            example: 2022-10-05T00:00:00.000+00:00
	 *                      extremeData:
	 *                        type: object
	 *                        properties:
	 *                          max:
	 *                            type: object
	 *                            properties:
	 *                              amount:
	 *                                type: number
	 *                                example: 100
	 *                              date:
	 *                                type: string
	 *                                example: 2022-10-05T00:00:00.000+00:00
	 *                          min:
	 *                            type: object
	 *                            properties:
	 *                              amount:
	 *                                type: number
	 *                                example: 100
	 *                              date:
	 *                                type: string
	 *                                example: 2022-10-05T00:00:00.000+00:00
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
