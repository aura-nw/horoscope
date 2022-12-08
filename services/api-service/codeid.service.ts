/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Service, Get } from '@ourparentcenter/moleculer-decorators-extended';
import { AssetIndexParams } from 'types/asset';
import { ErrorCode, ErrorMessage, MoleculerDBService, ResponseDto } from '../../types';
import { CODEID_MANAGER_ACTION, LIST_NETWORK } from '../../common/constant';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'codeid',
	version: 1,
	mixins: [dbBlockMixin],
})
export default class BlockService extends MoleculerDBService<
	{
		rest: 'v1/codeid';
	},
	unknown
> {
	/**
	 *  @swagger
	 *  /v1/codeid/{chainId}/{codeId}/checkStatus:
	 *    get:
	 *      tags:
	 *        - CodeId
	 *      summary: Check status asset by code_id after register
	 *      description: Check status asset by code_id after register
	 *      parameters:
	 *        - in: path
	 *          name: chainId
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet-2","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-2","cosmoshub-4"]
	 *          description: "Chain Id of network"
	 *        - in: path
	 *          name: codeId
	 *          required: true
	 *          schema:
	 *            type: number
	 *          description: "Code Id of stored contract need to query"
	 *      responses:
	 *        '200':
	 *          description: CodeId information
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
	 *                      status:
	 *                        type: string
	 *                        example: "REJECTED"
	 *                      contractType:
	 *                        type: string
	 *                        example: "CW20"
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
	@Get('/:chainId/:codeId/checkStatus', {
		name: 'checkStatus',
		restricted: ['api'],
		params: {
			codeId: { type: 'number', convert: true },
			chainId: {
				type: 'string',
				enum: LIST_NETWORK.map((e) => e.chainId),
			},
		},
	})
	async checkStatus(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			/* eslint-disable camelcase */
			const result: any = await this.broker.call(CODEID_MANAGER_ACTION.CHECK_STATUS, {
				chain_id: ctx.params.chainId,
				code_id: ctx.params.codeId,
			});
			/* eslint-enable camelcase */
			this.logger.debug('codeid-manager.checkStatus res', result);

			return (response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: { status: result.status, contractType: result.contractType },
			});
		} catch (error) {
			this.logger.error('call codeid-manager.checkStatus error', error);
			return (response = {
				code: ErrorCode.WRONG,
				message: ErrorMessage.WRONG,
				data: { error },
			});
		}
	}
}
