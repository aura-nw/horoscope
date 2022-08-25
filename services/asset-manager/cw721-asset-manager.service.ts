/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { Context } from 'moleculer';
import { Action, Method, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721AssetMixin } from '../../mixins/dbMixinMongoose';
import { GetHolderRequest } from 'types';
import { CursorOptions, FilterOptions } from 'moleculer-db';
import _ from 'lodash';

@Service({
	name: 'CW721-asset-manager',
	mixins: [dbCW721AssetMixin],
	version: 1,
	actions: {
		'act-insert': {
			async handler(ctx: Context): Promise<any> {
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
				return await this.adapter.find(ctx.params);
			},
		},
		'act-join-media-link': {
			cache: {
				ttl: 10,
			},
			async handler(ctx: Context<CursorOptions, Record<string, unknown>>): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params cw721-asset-manager aggregate media ${JSON.stringify(ctx.params)}`,
				);
				let listAggregate: any[] = [
					{
						$match: ctx.params.query,
					},
					{
						$lookup: {
							from: 'cw721_media_link',
							localField: 'media_link',
							foreignField: 'key',
							as: 'media_info',
						},
					},
				];
				if (ctx.params.sort) {
					listAggregate.push({
						$sort: ctx.params.sort,
					});
				}
				if (ctx.params.offset) {
					listAggregate.push({
						$skip: ctx.params.offset,
					});
				}
				if (ctx.params.limit) {
					listAggregate.push({
						$limit: ctx.params.limit,
					});
				}
				// @ts-ignore
				return await this.adapter.aggregate(listAggregate);
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
				return await this.upsert_handler(ctx.params);
			},
		},
	},
})
export default class CW721AssetManagerService extends moleculer.Service {
	async upsert_handler(asset: any) {
		this.logger.debug(`upsert_handler asset `, asset);
		let item = await this.adapter.findOne({ asset_id: asset.asset_id });
		if (item) {
			asset._id = item._id;
			if (
				item.contract_address != asset.contract_address ||
				item.token_id != asset.token_id ||
				item.owner != asset.owner ||
				item.is_burned != asset.is_burned
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
		let result = await this.adapter.aggregate([
			{
				$match: ctx.params.query,
			},
			{
				$group: {
					_id: {
						chain_id: '$custom_info.chain_id',
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
					chain_id: '$_id.chain_id',
					contract_address: '$_id.contract_address',
					owner: '$_id.owner',
				},
			},
			{
				$project: {
					'_id.contract_address': 0,
					'_id.chain_id': 0,
					'_id.owner': 0,
				},
			},
		]);
		return result;
	}

	@Action()
	async countHolderByAddress(ctx: Context<CursorOptions, Record<string, unknown>>) {
		let result = await this.adapter.aggregate([
			{
				$match: ctx.params.query,
			},
			{
				$group: {
					_id: {
						chain_id: '$custom_info.chain_id',
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
