/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { CallingOptions, Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Job } from 'bull';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Common } from '../asset-indexer/common.service';
import {
	CW721_MANAGER_ACTION,
	CW721_MEDIA_MANAGER_ACTION,
	LIST_NETWORK,
	MEDIA_STATUS,
} from '../../common/constant';
import { Config } from '../../common';

const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = 0;
// Const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const opts: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };
import { queueConfig } from '../../config/queue';
import { CW721AssetEntity } from '../../entities/cw721-asset.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
@Service({
	name: 'CW721-asset-media-manager',
	mixins: [dbCW721MediaLinkMixin, queueService(queueConfig.redis, queueConfig.opts)],
	version: 1,
	broker: {},
	queues: {
		'CW721-asset-media-manager.update-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_UPDATE_MEDIA_LINK, 10),
			async process(job: Job) {
				job.progress(10);
				// @ts-ignore
				await this.updateMediaLink(
					job.data.sourceUri,
					job.data.uri,
					job.data.type,
					job.data.fileName,
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
					`ctx.params CW721-asset-media-manager insert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				this.actions.useDb({ query: { chainId: ctx.params.chainId } });
				// @ts-ignore
				return await this.adapter.insert(ctx.params);
			},
		},
		// 'act-count': {
		// 	Async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		This.logger.debug(`ctx.params CW721-asset-media-manager count ${JSON.stringify(ctx.params)}`);
		// 		// @ts-ignore
		// 		Return await this.adapter.count(ctx.params);
		// 	}
		// },
		'act-find': {
			// Cache: { ttl: 10 },
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.actions.useDb({
					// @ts-ignore
					query: { chainId: ctx.params.query['custom_info.chain_id'] },
				});
				// @ts-ignore
				delete ctx.params.query['custom_info.chain_id'];
				// @ts-ignore
				this.logger.info(
					`ctx.params CW721-asset-media-manager find ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			},
		},
		// 'act-list': {
		// 	Async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		This.logger.debug(`ctx.params CW721-asset-media-manager list ${JSON.stringify(ctx.params)}`);
		// 		// @ts-ignore
		// 		Return await this.adapter.list(ctx.params);
		// 	}
		// },
		'act-upsert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				// This.actions.useDb({query: {chainId: ctx.params.query['custom_info.chain_id']}});
				// @ts-ignore
				this.logger.debug(
					`ctx.params CW721-asset-media-manager upsert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.upsertHandler(ctx.params);
			},
		},
		'update-media-link': {
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const fileName = ctx.params.fileName;
				const key = ctx.params.key;
				const chainId = ctx.params.chainId;
				const type = ctx.params.type;
				const assetId = ctx.params.assetId;
				const field = ctx.params.field;
				const sourceUri = ctx.params.sourceUri;
				// @ts-ignore
				this.logger.debug('update-media-link ctx.params', uri, fileName, key, chainId);
				// @ts-ignore
				// Await this.updateMediaLink(uri, fileName, key);
				this.createJob(
					'CW721-asset-media-manager.update-media-link',
					{
						sourceUri,
						uri,
						type,
						fileName,
						key,
						chainId,
						field,
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
				// @ts-ignore
				const chainId = ctx.params.query.chainId;
				const network = LIST_NETWORK.find((x) => x.chainId === chainId);
				if (network && network.databaseName) {
					// @ts-ignore
					this.adapter.useDb(network.databaseName);
				}
			},
		},
	},
})
export default class CW721AssetMediaManagerService extends moleculer.Service {
	async upsertHandler(assetMedia: any) {
		this.logger.debug('asset ', assetMedia);
		const network = LIST_NETWORK.find((x) => x.chainId === assetMedia.custom_info.chain_id);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}
		const item = await this.adapter.findOne({ key: assetMedia.key });
		if (item) {
			// This.logger.debug(`rs `, item._id);
			assetMedia._id = item._id;
			await this.adapter.updateById(item._id, assetMedia);
		} else {
			await this.adapter.insert(assetMedia);
		}
		return assetMedia._id;
	}

	async updateMediaLink(
		sourceUri: string,
		uri: string,
		type: string,
		fileName: string,
		key: string,
		chainId: string,
		field: string,
	) {
		try {
			// This.logger.info("updateMediaLink", uri, key);
			const result: any = await Common.handleUri(uri, type, fileName);
			this.logger.info(result);
			this.logger.debug('result handle uri:', JSON.stringify(result));
			if (result) {
				this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
					key,
					media_link: result.linkS3,
					content_type: result.contentType,
					status: MEDIA_STATUS.COMPLETED,
					custom_info: {
						chain_id: chainId,
					},
				});
				const query: any = {
					$or: [
						{ 'metadata.image': sourceUri },
						{ 'metadata.animation_url': sourceUri },
						{
							'asset_info.data.info.token_uri': sourceUri,
						},
					],
				};

				const listFoundCW721: CW721AssetEntity[] = await this.broker.call(
					CW721_MANAGER_ACTION.FIND,
					{
						query,
					},
				);
				if (listFoundCW721 && listFoundCW721.length > 0) {
					listFoundCW721.map((cw721: CW721AssetEntity) => {
						this.logger.debug('CW721 update: ', JSON.stringify(cw721));
						if (cw721?.metadata?.image === sourceUri) {
							cw721.image = {
								link_s3: result.linkS3,
								content_type: result.contentType,
							};
							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: cw721,
								updateOperator: {
									$set: {
										image: {
											link_s3: result.linkS3,
											content_type: result.contentType,
										},
									},
								},
							});
						}
						if (cw721?.metadata?.animation_url === sourceUri) {
							cw721.animation = {
								link_s3: result.linkS3,
								content_type: result.contentType,
							};
							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: cw721,
								updateOperator: {
									$set: {
										animation: {
											link_s3: result.linkS3,
											content_type: result.contentType,
										},
									},
								},
							});
						}
						this.broker.call(CW721_MANAGER_ACTION.UPSERT, cw721);
						this.logger.info(cw721);
					});
				}
			} else {
				throw new Error('URI is invalid');
			}
		} catch (err: any) {
			this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
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
		this.getQueue('CW721-asset-media-manager.update-media-link').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW721-asset-media-manager.update-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW721-asset-media-manager.update-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
