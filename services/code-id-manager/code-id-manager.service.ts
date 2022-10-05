/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCodeIDMixin } from '../../mixins/dbMixinMongoose';
import { LIST_NETWORK } from '../../common/constant';
// import { Ok } from 'ts-results';

@Service({
	name: 'codeid-manager',
	mixins: [dbCodeIDMixin],
	version: 1,
	actions: {
		useDb: {
			async handler(ctx: Context){
				//@ts-ignore
				const chainId = ctx.params.query['chainId'];
				const network = LIST_NETWORK.find((x) => x.chainId == chainId);
				if (network && network.databaseName) {
					// @ts-ignore
					this.adapter.useDb(network.databaseName);
				}
			}
		},
		'act-insert': {
			async handler(ctx: Context) {
				// @ts-ignore
				this.actions.useDb({query: {chainId: ctx.params.chain_id}});
				// @ts-ignore
				this.logger.debug(`ctx.params insert ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.adapter.insert(ctx.params);
			},
		},
		'act-find': {
			async handler(ctx: Context) {
				// @ts-ignore
				this.actions.useDb({query: {chainId: ctx.params.query['custom_info.chain_id']}});
				// @ts-ignore
				this.logger.debug(`ctx.params find ${JSON.stringify(ctx.params)}`);
				//@ts-ignore
				const chainId = ctx.params.query['custom_info.chain_id'];
				const network = LIST_NETWORK.find((x) => x.chainId == chainId);
				if (network && network.databaseName) {
					// @ts-ignore
					this.adapter.useDb(network.databaseName);
				}
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			},
		},
		checkStatus: {
			async handler(ctx: Context) {
				// @ts-ignore
				this.actions.useDb({query: {chainId: ctx.params.chain_id}});
				// @ts-ignore
				let foundCodeID = await this.adapter.findOne({ code_id: ctx.params.code_id, 'custom_info.chain_id': ctx.params.chain_id });
				// @ts-ignore
				this.logger.debug(`found ${JSON.stringify(foundCodeID)}`);
				if (foundCodeID) {
					return foundCodeID?.status;
				} else {
					return 'NotFound';
				}
			},
		},
		'act-updateMany': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.actions.useDb({query: {chainId: ctx.params.condition['custom_info.chain_id']}});
				// @ts-ignore
				this.logger.debug(`ctx.params ${JSON.stringify(ctx.params.condition, ctx.params.update)}`);
				// @ts-ignore
				return await this.adapter.updateMany(ctx.params.condition, ctx.params.update);
			},
		},
	},
})
export default class CodeIDService extends moleculer.Service {}
