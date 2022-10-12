/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW20AssetMixin } from '../../mixins/dbMixinMongoose';
import { CursorOptions, QueryOptions } from 'moleculer-db';
import { ICW20Asset } from '@Model';
import { ObjectID, ObjectId } from 'bson';
import { LIST_NETWORK } from '../../common/constant';

@Service({
	name: 'CW20-asset-manager',
	mixins: [dbCW20AssetMixin],
	version: 1,
	actions: {
		'act-insert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw20-asset-manager insert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.chain_id } });
				// @ts-ignore
				return await this.adapter.insert(ctx.params);
			},
		},
		'act-count': {
			cache: {
				ttl: 10,
			},
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw20-asset-manager count ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({
					// @ts-ignore
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				return await this.adapter.count(ctx.params);
			},
		},
		'act-find': {
			cache: {
				ttl: 10,
			},
			async handler(ctx: Context<QueryOptions, Record<string, unknown>>): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw20-asset-manager find ${JSON.stringify(ctx.params)}`,
				);
				if (ctx.params.nextKey) {
					ctx.params.query['_id'] = { $lt: new ObjectID(ctx.params.nextKey) };
				}
				// @ts-ignore
				this.actions.useDb({
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			},
		},
		'act-list': {
			cache: {
				ttl: 10,
			},
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw20-asset-manager list ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.chain_id } });
				// @ts-ignore
				return await this.adapter.list(ctx.params);
			},
		},
		'act-upsert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw20-asset-manager upsert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.chain_id } });
				// @ts-ignore
				return await this.upsert_handler(ctx.params);
			},
		},
		useDb: {
			async handler(ctx: Context) {
				//@ts-ignore
				const chainId = ctx.params.query['chainId'];
				const network = LIST_NETWORK.find((x) => x.chainId == chainId);
				if (network && network.databaseName) {
					// @ts-ignore
					this.adapter.useDb(network.databaseName);
				}
			},
		},
	},
})
export default class CW20AssetManagerService extends moleculer.Service {
	async upsert_handler(asset: any) {
		this.logger.debug(`asset `, asset);
		let item = await this.adapter.findOne({ asset_id: asset.asset_id });
		if (item) {
			// this.logger.debug(`rs `, item._id);
			asset._id = item._id;
			if (
				asset.balance != item.balance ||
				asset.owner != item.owner ||
				asset.code_id != item.code_id ||
				asset.contract_address != item.contract_address ||
				asset.asset_info.data.total_supply != item.asset_info.data.total_supply ||
				asset.asset_info.data.decimals != item.asset_info.data.decimals ||
				asset.asset_info.data.symbol != item.asset_info.data.symbol ||
				asset.asset_info.data.name != item.asset_info.data.name
			) {
				await this.adapter.updateById(item._id, asset);
			}
		} else {
			await this.adapter.insert(asset);
		}
		return asset._id;
	}

	@Action()
	async getHolderByAddress(ctx: Context<CursorOptions, Record<string, unknown>>) {
		// @ts-ignore
		this.actions.useDb({ query: { chainId: ctx.params.query['custom_info.chain_id'] } });
		return await this.adapter.find(ctx.params);
	}

	@Action()
	async countHolderByAddress(ctx: Context<CursorOptions, Record<string, unknown>>) {
		// @ts-ignore
		this.actions.useDb({ query: { chainId: ctx.params.query['custom_info.chain_id'] } });
		return await this.adapter.count(ctx.params);
	}
}
