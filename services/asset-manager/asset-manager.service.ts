/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbAssetMixin } from '../../mixins/dbMixinMongoose';

@Service({
	name: 'asset-manager',
	mixins: [
		dbAssetMixin,
	],
	version: 1,
	actions: {
		"upsert": {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(`ctx.params asset-manager upsert ${ctx, JSON.stringify(ctx.params)}`);
				// @ts-ignore
				return await this.upsert_handler(ctx.params);
			}
		}
	},
})

export default class AssetManagerService extends moleculer.Service {
	async upsert_handler(asset: any) {
		this.logger.debug(`asset `, asset);
		let item = await this.adapter.findOne({ asset_id: asset.asset_id });
		if (item) {
			// this.logger.debug(`rs `, item._id);
			asset._id = item._id;
			await this.adapter.updateById(item._id, asset);
		} else {
			await this.adapter.insert(asset);
		}
		return asset._id;
	};
}
