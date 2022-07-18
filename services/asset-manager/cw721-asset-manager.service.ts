/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';

@Service({
	name: 'cw721-asset-manager',
	mixins: [
		dbCW721AssetMixin,
	],
	version: 1,
	actions: {
		"insert": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params cw721-asset-manager insert ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.adapter.insert(ctx.params);
			}
		},
		"count": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params cw721-asset-manager count ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.adapter.count(ctx.params);
			}
		},
		"find": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params cw721-asset-manager find ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			}
		},
		"list": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params cw721-asset-manager list ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.adapter.list(ctx.params);
			}
		},
		"upsert": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params cw721-asset-manager upsert ${JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.upsert_handler(ctx.params);
			}
		}
	},
})

export default class CW721AssetManagerService extends moleculer.Service {
	async upsert_handler(asset: any) {
		this.logger.debug(`upsert_handler asset `, asset);
		let item = await this.adapter.findOne({ asset_id: asset.asset_id });
		if (item) {
			asset._id = item._id;
			await this.adapter.updateById(item._id, asset);
		} else {
			await this.adapter.insert(asset);
		}
		return asset._id;
	};
}
