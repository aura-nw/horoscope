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
	 *  /v1/codeid/{code_id}/checkStatus:
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
	 *          name: code_id
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
	@Get('/:code_id/checkStatus', {
		name: 'checkStatus',
		restricted: ['api'],
		params: {
			code_id: { type: 'number', convert: true },
		},
	})
	async checkStatus(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		return await this.broker
			.call('code_id.checkStatus', { code_id: ctx.params.code_id })
			.then((res) => {
				let status = null;
				this.logger.debug('code_id.checkStatus res', res);
				status = (res === Ok) ? "Not Found" : res;

				return (response = {
					code: ErrorCode.SUCCESSFUL,
					message: ErrorMessage.SUCCESSFUL,
					data: { status },
				});
			})
			.catch((error) => {
				this.logger.error('call code_id.checkStatus error', error);
				return (response = {
					code: ErrorCode.WRONG,
					message: ErrorMessage.WRONG,
					data: { error },
				});
			});
	}
}
