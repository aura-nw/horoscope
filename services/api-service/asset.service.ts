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
	name: 'asset',
	version: 1,
	mixins: [dbBlockMixin],
})
export default class BlockService extends MoleculerDBService<
	{
		rest: 'v1/asset';
	},
	IBlock
> {
	/**
	 *  @swagger
	 *
	 *  /v1/asset/indexAsset:
	 *    post:
	 *      tags:
	 *      - "Asset"
	 *      summary:  Register asset with the code id
	 *      description: Register asset with the code id
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:
	 *        - in: body
	 *          name: params
	 *          schema:
	 *            type: object
	 *            required:
	 *              - name
	 *            properties:
	 *              code_id:
	 *                type: number
	 *                description: code id
	 *      responses:
	 *        200:
	 *          description: Register result
	 *        422:
	 *          description: Missing parameters
	 */
	@Post<RestOptions>('/indexAsset', {
		name: 'indexAsset',
		restricted: ['api'],
		params: {
			code_id: ['number|integer|positive'],
		},
	})
	async indexAsset(ctx: Context<AssetIndexParams, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		let registed: boolean = false;
		return await this.broker
			.call('code_id.checkStatus', { code_id: ctx.params.code_id })
			.then((res) => {
				this.logger.info('code_id.checkStatus res', res);
				switch (res) {
					case Ok:
						this.broker.call('code_id.create', {
							_id: new Types.ObjectId(),
							code_id: ctx.params.code_id,
							status: Status.WAITING,
						});
					case Status.TBD:
						// case Status.WAITING:
						this.broker.emit('code_id.validate', ctx.params.code_id);
						registed = true;
						break;
					default:
						registed = false;
						break;
				}
				return (response = {
					code: ErrorCode.SUCCESSFUL,
					message: ErrorMessage.SUCCESSFUL,
					data: { registed },
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
