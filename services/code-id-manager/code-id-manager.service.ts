/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCodeIDMixin } from '../../mixins/dbMixinMongoose';
// import { Ok } from 'ts-results';

@Service({
	name: 'code_id',
	mixins: [dbCodeIDMixin],
	version: 1,
	actions: {
		checkStatus: {
			async handler(ctx: Context) {
				// @ts-ignore
				let foundCodeID = await this.adapter.findOne(ctx.params);
				// @ts-ignore
				this.logger.info(`found ${JSON.stringify(foundCodeID)}`);
				if (foundCodeID) {
					return foundCodeID?.status;
				} else {
					return "NotFound";
				}
			},
		},
		updateMany: {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params ${(ctx.params.condition, ctx.params.update)}`);
				// @ts-ignore
				return await this.adapter.updateMany(ctx.params.condition, ctx.params.update);
			},
		},
	},
})
export default class CodeIDService extends moleculer.Service {}
