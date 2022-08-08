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
import { ErrorCode, ErrorMessage, MoleculerDBService, ResponseDto, RestOptions } from '../../types';
import { IBlock } from '../../entities';
import { Common } from '@MicroServices/asset-indexer/common.service';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'test',
	version: 1,
	mixins: [],
})
export default class BlockService extends MoleculerDBService<
{
	rest: 'v1/test';
},
{}
> {
	/**
	 *  @swagger
	 *  /v1/test/url:
	 *    get:
	 *      tags:
	 *        - AAATest
	 *      summary: Check status of code_id
	 *      description: Check status of code_id
	 *      produces:
	 *        - application/json
	 *      consumes:
	 *        - application/json
	 *      parameters:	 
	 *        - in: query
	 *          name: url
	 *          required: true
	 *          type: string
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
	 */
	@Get('/url', {
		name: 'testxxx',
		restricted: ['api'],
		params: {
			url: { type: 'string' }
		},
	})
	async test(ctx: Context<any, Record<string, unknown>>) {
		let response: ResponseDto = {} as ResponseDto;
		try {
			const url = ctx.params.url;
			// const mess = "xxxxxxxxxxxxxxx";
			let file = await Common.getFileFromUrl(url);

			return (response = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data: { file }
			});
		} catch (error) {
			this.logger.error('call getFileFromUrl error', error);
			return (response = {
				code: ErrorCode.WRONG,
				message: ErrorMessage.WRONG,
				data: { error },
			});
		}
	}
}
