/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { CursorOptions, QueryOptions } from 'moleculer-db';
import _ from 'lodash';
import { ObjectID } from 'bson';
import { LIST_NETWORK } from '../../common/constant';

@Service({
	name: 'CW721-asset-manager',
	mixins: [dbCW721AssetMixin],
	version: 1,
	actions: {
		'act-insert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.custom_info.chain_id } });
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw721-asset-manager insert ${JSON.stringify(ctx.params)}`,
				);
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
					`ctx.params cw721-asset-manager count ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({
					// @ts-ignore
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				delete ctx.params.query['custom_info.chain_id'];
				// @ts-ignore
				return await this.adapter.count(ctx.params);
			},
		},
		'act-find': {
			cache: {
				ttl: 10,
			},
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw721-asset-manager find ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({
					// @ts-ignore
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				delete ctx.params.query['custom_info.chain_id'];
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
					`ctx.params cw721-asset-manager list ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.adapter.list(ctx.params);
			},
		},
		'act-upsert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw721-asset-manager upsert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				const resultUpsert = await this.upsert_handler(ctx.params);
				return resultUpsert;
			},
		},
		'act-update-by-id': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw721-asset-manager update ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.updateById(ctx.params.obj, ctx.params.updateOperator);
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
export default class CW721AssetManagerService extends moleculer.Service {
	async upsert_handler(asset: any) {
		this.logger.debug(`upsert_handler asset `, asset);
		// @ts-ignore
		this.actions.useDb({ query: { chainId: asset.custom_info.chain_id } });
		let item = await this.adapter.findOne({ asset_id: asset.asset_id });
		if (item) {
			this.logger.debug('this is existed item', JSON.stringify(item));
			asset._id = item._id;
			if (
				item.contract_address != asset.contract_address ||
				item.token_id != asset.token_id ||
				item.owner != asset.owner ||
				item.is_burned != asset.is_burned ||
				item.image != asset.image ||
				item.animation != asset.animation
			) {
				await this.adapter.updateById(item._id, asset);
			}
			return asset._id;
		} else {
			this.logger.debug('this is not existed item: ', JSON.stringify(asset));
			let resultInsert = await this.adapter.insert(asset);
			this.logger.debug('result insert: ', JSON.stringify(resultInsert));
			return resultInsert._id;
		}
	}

	async updateById(asset: any, updateOperator: any) {
		this.logger.debug(`updateById asset `, asset);
		// @ts-ignore
		this.actions.useDb({ query: { chainId: asset.custom_info.chain_id } });
		if (asset._id) {
			return await this.adapter.updateById(asset._id, updateOperator);
		}
	}

	@Action()
	async getHolderByAddress(ctx: Context<CursorOptions, Record<string, unknown>>) {
		// @ts-ignore
		this.actions.useDb({ query: { chainId: ctx.params.query['custom_info.chain_id'] } });
		// @ts-ignore
		delete ctx.params.query['custom_info.chain_id'];
		let result = await this.adapter.aggregate([
			{
				$match: ctx.params.query,
			},
			{
				$group: {
					_id: {
						contract_address: '$contract_address',
						owner: '$owner',
					},
					quantity: { $sum: 1 },
					updatedAt: { $max: '$updatedAt' },
				},
			},
			{
				$sort: ctx.params.sort,
			},
			{
				$skip: ctx.params.offset,
			},
			{
				$limit: ctx.params.limit,
			},
			{
				$addFields: {
					contract_address: '$_id.contract_address',
					owner: '$_id.owner',
				},
			},
			{
				$project: {
					'_id.contract_address': 0,
					'_id.owner': 0,
				},
			},
		]);
		return result;
	}

	@Action()
	async countHolderByAddress(ctx: Context<CursorOptions, Record<string, unknown>>) {
		// @ts-ignore
		this.actions.useDb({ query: { chainId: ctx.params.query['custom_info.chain_id'] } });
		// @ts-ignore
		delete ctx.params.query['custom_info.chain_id'];
		let result = await this.adapter.aggregate([
			{
				$match: ctx.params.query,
			},
			{
				$group: {
					_id: {
						contract_address: '$contract_address',
						owner: '$owner',
					},
					quantity: { $sum: 1 },
				},
			},
			{
				$count: 'count',
			},
		]);
		return result[0].count;
	}
}
