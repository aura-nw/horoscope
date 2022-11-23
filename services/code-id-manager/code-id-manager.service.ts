/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
// @ts-nocheck
'use strict';
import moleculer, { Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCodeIDMixin } from '../../mixins/dbMixinMongoose';
import { LIST_NETWORK } from '../../common/constant';

@Service({
	name: 'codeid-manager',
	mixins: [dbCodeIDMixin],
	version: 1,
	actions: {
		useDb: {
			async handler(ctx: Context) {
				const chainId = ctx.params.query['chainId'];
				const network = LIST_NETWORK.find((x) => x.chainId == chainId);
				if (network && network.databaseName) {
					this.adapter.useDb(network.databaseName);
				}
			},
		},
		'act-insert': {
			async handler(ctx: Context) {
				this.actions.useDb({ query: { chainId: ctx.params.custom_info.chain_id } });

				this.logger.debug(`ctx.params insert ${JSON.stringify(ctx.params)}`);

				return await this.adapter.insert(ctx.params);
			},
		},
		'act-find': {
			async handler(ctx: Context) {
				this.actions.useDb({
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				delete ctx.params.query['custom_info.chain_id'];
				this.logger.debug(`ctx.params find ${JSON.stringify(ctx.params)}`);
				return await this.adapter.find(ctx.params);
			},
		},
		checkStatus: {
			async handler(ctx: Context) {
				this.actions.useDb({ query: { chainId: ctx.params.chain_id } });

				let foundCodeID = await this.adapter.findOne({
					code_id: ctx.params.code_id,
				});

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
				this.actions.useDb({
					query: { chainId: ctx.params.condition['custom_info.chain_id'] },
				});

				this.logger.debug(
					`ctx.params ${JSON.stringify(ctx.params.condition, ctx.params.update)}`,
				);
				delete ctx.params.condition['custom_info.chain_id'];
				return await this.adapter.updateMany(ctx.params.condition, ctx.params.update);
			},
		},
	},
})
export default class CodeIDService extends moleculer.Service {}
