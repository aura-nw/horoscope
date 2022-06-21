/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
// import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { Context, ServiceBroker } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCodeIDMixin } from '../../mixins/dbMixinMongoose';
import { Status } from '../../model';
import { info } from 'console';
import { Ok } from 'ts-results';

// const callApiMixin = new CallApiMixin().start();

@Service({
	name: 'code_id',
	mixins: [
		dbCodeIDMixin,
	],
	actions: {
		"checkStatus": {
			async handler(ctx: Context){
				// @ts-ignore
				// return this.adapter.findOne(ctx.params);
				let foundProposal = await this.adapter.findOne(ctx.params);
				// @ts-ignore
				this.logger.debug(`found ${JSON.stringify(foundProposal)}`);
				if (foundProposal) {
					return foundProposal?.status;
				} else {
					return Ok;
				}
			}
		},
		"updateMany": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params ${ctx.params.condition, ctx.params.update}`);
				// @ts-ignore
				return await this.adapter.updateMany(ctx.params.condition, ctx.params.update);
			}
		}
	},
})

export default class CodeIDService extends moleculer.Service {
}
