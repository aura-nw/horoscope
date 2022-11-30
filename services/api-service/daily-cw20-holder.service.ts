/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import {
	Put,
	Method,
	Service,
	Get,
	Action,
	Post,
} from '@ourparentcenter/moleculer-decorators-extended';
import { dbDailyCw20HolderMixin } from '../../mixins/dbMixinMongoose';
import { ErrorCode, ErrorMessage, MoleculerDBService } from '../../types';
import { LIST_NETWORK } from '../../common/constant';
import { IDailyCw20Holder } from '@Model';

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
	 *            enum: ["euphoria-2","cosmoshub-4","osmosis-1"]
	 *            default: "aura-testnet-2"
	 *          description: "Chain Id of network need to query"
	 *        - name: addresses[]
	 *          in: query
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
	 *                      code_id:
	 *                        type: number
	 *                        example: 19
	 *                      contract_address:
	 *                        type: string
	 *                        example: aura1qppau370zs6xnduuv3jju4xw0kp2xww20wy75ye2hvy9cc99ehtqxlqnza
	 *                      old_holders:
	 *                        type: number
	 *                        example: 50
	 *                      new_holders:
	 *                        type: number
	 *                        example: 60
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
			addresses: { type: 'array', items: 'string', optional: true },
		},
	})
	async getCw20HolderChangePercent(ctx: Context<any>) {
		const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		let data = await this.adapter.lean({
			query: {
				contract_address: { $in: ctx.params.addresses },
			},
		});
		return {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data,
		};
	}
}
