/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { IDailyCw20Holder } from '../../model';
import { dbDailyCw20HolderMixin } from '../../mixins/dbMixinMongoose';
import { ErrorCode, ErrorMessage, MoleculerDBService } from '../../types';
import { LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'daily-cw20-holder',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbDailyCw20HolderMixin],
	/**
	 * Settings
	 */
})
export default class DailyCw20HolderService extends MoleculerDBService<
	{
		rest: 'v1/daily-cw20-holder';
	},
	IDailyCw20Holder
> {
	/**
	 *  @swagger
	 *  /v1/daily-cw20-holder:
	 *    get:
	 *      tags:
	 *        - AuraScan Statistics
	 *      summary: Get CW20's holder changing percentage daily
	 *      description: Get CW20's holder changing percentage daily
	 *      parameters:
	 *        - name: chainId
	 *          in: query
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *            default: "aura-testnet-2"
	 *          description: "Chain Id of network need to query"
	 *        - name: addresses[]
	 *          in: query
	 *          required: true
	 *          schema:
	 *            type: array
	 *            items:
	 *              type: string
	 *          description: "List of CW20 addresses need to query"
	 *      responses:
	 *        '200':
	 *          description: Daily CW20's holder changing percentage
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
	 *                      contract_address:
	 *                        type: string
	 *                        example: aura1qppau370zs6xnduuv3jju4xw0kp2xww20wy75ye2hvy9cc99ehtqxlqnza
	 *                      holders:
	 *                        type: number
	 *                        example: 50
	 *                      change_percent:
	 *                        type: number
	 *                        example: 20
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
		name: 'getCw20HolderChangePercent',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			chainId: 'string',
			addresses: { type: 'array', items: 'string', optional: false },
		},
	})
	async getCw20HolderChangePercent(ctx: Context<any>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}

		const cw20Holders = await this.adapter.lean({
			query: {
				// eslint-disable-next-line camelcase
				contract_address: { $in: ctx.params.addresses },
			},
		});
		const data = cw20Holders.map((cw20: any) => ({
			contract_address: cw20.contract_address,
			holders: cw20.new_holders,
			percentage: cw20.change_percent,
		}));
		// const listQueryHolders: any = [];
		// ctx.params.addresses.map((addr: any) =>
		// 	listQueryHolders.push(
		// 		this.broker.call('v1.CW20-asset-manager.act-count', {
		// 			query: {
		// 				contract_address: addr,
		// 				balance: { $ne: '0' },
		// 				'custom_info.chain_id': ctx.params.chainId,
		// 			},
		// 		}),
		// 	),
		// );
		// const holders = await Promise.all(listQueryHolders);
		// const data = holders.map((hold: any, index: any) => {
		// 	const percent = cw20Holders.find(
		// 		(d: any) => d.contract_address === ctx.params.addresses[index],
		// 	);
		// 	return {
		// 		contract_address: ctx.params.addresses[index],
		// 		holders: hold,
		// 		percentage: percent ? percent.change_percent : 0,
		// 	};
		// });

		return {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data,
		};
	}
}
