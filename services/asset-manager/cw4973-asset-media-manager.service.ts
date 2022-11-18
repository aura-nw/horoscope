/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { CallingOptions, Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW4973MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Common } from '../asset-indexer/common.service';

import {
	CW4973_MANAGER_ACTION,
	CW4973_MEDIA_MANAGER_ACTION,
	LIST_NETWORK,
	MEDIA_STATUS,
} from '../../common/constant';
import { Config } from '../../common';

const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = 0;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

import { QueueConfig } from '../../config/queue';
import { Job } from 'bull';
import { CW4973AssetEntity } from '../../entities/cw4973-asset.entity';
const QueueService = require('moleculer-bull');
@Service({
	name: 'CW4973-asset-media-manager',
	mixins: [dbCW4973MediaLinkMixin, QueueService(QueueConfig.redis, QueueConfig.opts)],
	version: 1,
	broker: {},
	queues: {
		'CW4973-asset-media-manager.update-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_UPDATE_MEDIA_LINK, 10),
			async process(job: Job) {
				job.progress(10);
				// @ts-ignore
				await this.updateMediaLink(
					job.data.sourceUri,
					job.data.uri,
					job.data.type,
					job.data.file_name,
					job.data.key,
					job.data.chainId,
					job.data.field,
				);
				job.progress(100);

				return true;
			},
		},
	},
	actions: {
		'act-insert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params CW4973-asset-media-manager insert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.chainId } });
				// @ts-ignore
				return await this.adapter.insert(ctx.params);
			},
		},
		// 'act-count': {
		// 	async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		this.logger.debug(`ctx.params CW4973-asset-media-manager count ${JSON.stringify(ctx.params)}`);
		// 		// @ts-ignore
		// 		return await this.adapter.count(ctx.params);
		// 	}
		// },
		'act-find': {
			// cache: { ttl: 10 },
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.actions.useDb({
					// @ts-ignore
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				this.logger.info(
					`ctx.params CW4973-asset-media-manager find ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			},
		},
		// 'act-list': {
		// 	async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		this.logger.debug(`ctx.params CW4973-asset-media-manager list ${JSON.stringify(ctx.params)}`);
		// 		// @ts-ignore
		// 		return await this.adapter.list(ctx.params);
		// 	}
		// },
		'act-upsert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				// this.actions.useDb({query: {chainId: ctx.params.query['custom_info.chain_id']}});
				// @ts-ignore
				this.logger.debug(
					`ctx.params CW4973-asset-media-manager upsert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.upsert_handler(ctx.params);
			},
		},
		'update-media-link': {
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const file_name = ctx.params.file_name;
				const key = ctx.params.key;
				const chain_id = ctx.params.chainId;
				const type = ctx.params.type;
				const assetId = ctx.params.assetId;
				const field = ctx.params.field;
				const sourceUri = ctx.params.sourceUri;
				// @ts-ignore
				this.logger.debug('update-media-link ctx.params', uri, file_name, key, chain_id);
				// @ts-ignore
				// await this.updateMediaLink(uri, file_name, key);
				this.createJob(
					'CW4973-asset-media-manager.update-media-link',
					{
						sourceUri,
						uri,
						type,
						file_name: file_name,
						key,
						chainId: chain_id,
						field: field,
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 3,
						},
						attempts: 5,
						backoff: 5000,
					},
				);
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
export default class CW4973AssetMediaManagerService extends moleculer.Service {
	async upsert_handler(asset_media: any) {
		this.logger.debug(`asset `, asset_media);
		const network = LIST_NETWORK.find((x) => x.chainId == asset_media.custom_info.chain_id);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}
		let item = await this.adapter.findOne({ key: asset_media.key });
		if (item) {
			// this.logger.debug(`rs `, item._id);
			asset_media._id = item._id;
			await this.adapter.updateById(item._id, asset_media);
		} else {
			await this.adapter.insert(asset_media);
		}
		return asset_media._id;
	}

	async updateMediaLink(
		sourceUri: string,
		uri: string,
		type: string,
		file_name: string,
		key: string,
		chainId: string,
		field: string,
	) {
		try {
			// this.logger.info("updateMediaLink", uri, key);
			const result: any = await Common.handleUri(uri, type, file_name);
			this.logger.info(result);
			this.logger.debug('result handle uri:', JSON.stringify(result));
			if (result) {
				this.broker.call(CW4973_MEDIA_MANAGER_ACTION.UPSERT, {
					key,
					media_link: result.linkS3,
					content_type: result.contentType,
					status: MEDIA_STATUS.COMPLETED,
					custom_info: {
						chain_id: chainId,
					},
				});
				let query: any = {
					'custom_info.chain_id': chainId,
					$or: [
						{ 'metadata.image': sourceUri },
						{ 'metadata.animation_url': sourceUri },
						{
							'asset_info.data.info.token_uri': sourceUri,
						},
					],
				};
				// if (field == CW4973_FIELD.IMAGE) {
				// 	query['metadata.image'] = sourceUri;
				// } else if (field == CW4973_FIELD.ANIMATION) {
				// 	query['metadata.animation_url'] = sourceUri;
				// }

				let listFoundCW4973: CW4973AssetEntity[] = await this.broker.call(
					CW4973_MANAGER_ACTION.FIND,
					{
						query,
					},
				);
				if (listFoundCW4973 && listFoundCW4973.length > 0) {
					listFoundCW4973.map((CW4973: CW4973AssetEntity) => {
						this.logger.debug('CW4973 update: ', JSON.stringify(CW4973));
						if (CW4973?.metadata?.image == sourceUri) {
							CW4973.image = {
								link_s3: result.linkS3,
								content_type: result.contentType,
							};
							this.broker.call('v1.CW4973-asset-manager.act-update-by-id', {
								obj: CW4973,
								updateOperator: {
									$set: {
										image: {
											link_s3: result.linkS3,
											content_type: result.contentType,
										},
									},
								},
							});
							// this.broker.call('v1.CW4973-asset-manager.update', {
							// 	_id: CW4973._id,
							// 	image: {
							// 		link_s3: result.linkS3,
							// 		content_type: result.contentType,
							// 	},
							// });
						}
						if (CW4973?.metadata?.animation_url == sourceUri) {
							CW4973.animation = {
								link_s3: result.linkS3,
								content_type: result.contentType,
							};
							this.broker.call('v1.CW4973-asset-manager.act-update-by-id', {
								obj: CW4973,
								updateOperator: {
									$set: {
										animation: {
											link_s3: result.linkS3,
											content_type: result.contentType,
										},
									},
								},
							});
							// this.broker.call('v1.CW4973-asset-manager.update', {
							// 	_id: CW4973._id,
							// 	animation: {
							// 		link_s3: result.linkS3,
							// 		content_type: result.contentType,
							// 	},
							// });
						}
						this.broker.call(CW4973_MANAGER_ACTION.UPSERT, CW4973);
						this.logger.info(CW4973);
					});
				}
			} else {
				throw new Error('URI is invalid');
			}
		} catch (err: any) {
			this.broker.call(CW4973_MEDIA_MANAGER_ACTION.UPSERT, {
				key,
				media_link: '',
				status: MEDIA_STATUS.ERROR,
				custom_info: {
					chain_id: chainId,
				},
			});
			this.logger.error(err);
			throw err;
		}
	}

	async _start(): Promise<void> {
		this.getQueue('CW4973-asset-media-manager.update-media-link').on(
			'completed',
			(job: Job) => {
				this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
			},
		);
		this.getQueue('CW4973-asset-media-manager.update-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW4973-asset-media-manager.update-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
