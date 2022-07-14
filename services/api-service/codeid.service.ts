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
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { ErrorCode, ErrorMessage, MoleculerDBService, ResponseDto, RestOptions } from '../../types';
import { IBlock } from '../../entities';
import { AssetIndexParams } from 'types/asset';
import { Types } from 'mongoose';
// import rateLimit from 'micro-ratelimit';
import { Status } from '../../model/codeid.model';
import { Ok } from 'ts-results';
import { LIST_NETWORK } from 'common/constant';

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
IBlock
> {
	/**
	 *  @swagger
	 *  /v1/codeid/{chainId}/{codeId}/checkStatus:
	 *    get:
	 *      tags:
	 *        - CodeId
	 *      summary: Check status of code_id
	 *      description: Check status of code_id
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:	 
	 *        - in: path
	 *          name: chainId
	 *          required: true
	 *          type: string
	 *          example: aura-devnet
	 *          description: "Chain Id of network"
	 *        - in: path
	 *          name: codeId
	 *          required: true
	 *          type: number
	 *          description: "Code Id of stored contract need to query"
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/:chainId/:codeId/checkStatus', {
		name: 'checkStatus',
		restricted: ['api'],
		params: {
			codeId: { type: 'number', convert: true },
			chainId: { type: 'string', enum: LIST_NETWORK.map(function (e) { return e.chainId }) },
		},
	})
	async checkStatus(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			let status = await this.broker.call('v1.codeid-manager.checkStatus', {
				chain_id: ctx.params.chainId,
				code_id: ctx.params.codeId,
			});

			this.logger.debug('codeid-manager.checkStatus res', status);

			return (response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: { status },
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
