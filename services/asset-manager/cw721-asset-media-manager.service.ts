/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { CallingOptions, Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Common } from '../asset-indexer/common.service';
import { MediaStatus } from '../../model/cw721-asset-media.model';
import { CW721_MEDIA_MANAGER_ACTION, LIST_NETWORK } from '../../common/constant';
import { Config } from '../../common';

const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
// const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };
import { QueueConfig } from '../../config/queue';
import { Job } from 'bull';
const QueueService = require('moleculer-bull');
@Service({
	name: 'CW721-asset-media-manager',
	mixins: [dbCW721MediaLinkMixin, QueueService(QueueConfig.redis, QueueConfig.opts)],
	version: 1,
	broker: {},
	queues: {
		'update-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_UPDATE_MEDIA_LINK, 10),
			async process(job: Job) {
				job.progress(10);
				// @ts-ignore
				await this.updateMediaLink(
					job.data.uri,
					job.data.type,
					job.data.file_name,
					job.data.key,
					job.data.chainId,
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
		// 	async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		this.logger.debug(`ctx.params CW721-asset-media-manager count ${JSON.stringify(ctx.params)}`);
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
					`ctx.params CW721-asset-media-manager find ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				return await this.adapter.find(ctx.params);
			},
		},
		// 'act-list': {
		// 	async handler(ctx: Context): Promise<any> {
		// 		// @ts-ignore
		// 		this.logger.debug(`ctx.params CW721-asset-media-manager list ${JSON.stringify(ctx.params)}`);
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
					`ctx.params CW721-asset-media-manager upsert ${JSON.stringify(ctx.params)}`,
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
				// @ts-ignore
				this.logger.debug('update-media-link ctx.params', uri, file_name, key, chain_id);
				// @ts-ignore
				// await this.updateMediaLink(uri, file_name, key);
				this.createJob(
					'update-media-link',
					{
						uri: uri,
						type: type,
						file_name: file_name,
						key: key,
						chainId: chain_id,
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
export default class CW721AssetMediaManagerService extends moleculer.Service {
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
		uri: string,
		type: string,
		file_name: string,
		key: string,
		chainId: string,
	) {
		try {
			// this.logger.info("updateMediaLink", uri, key);
			const result: any = await Common.handleUri(uri, type, file_name);
			this.logger.info(result);
			this.logger.debug('result handle uri:', JSON.stringify(result));
			if (result) {
				this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
					key,
					media_link: result.linkS3,
					content_type: result.contentType,
					status: MediaStatus.COMPLETED,
					custom_info: {
						chain_id: chainId,
					},
				});
			} else {
				throw new Error('URI is invalid');
			}
		} catch (err: any) {
			this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
				key,
				media_link: '',
				status: MediaStatus.ERROR,
				custom_info: {
					chain_id: chainId,
				},
			});
			this.logger.error(err);
			throw err;
		}
	}

	async _start(): Promise<void> {
		this.getQueue('update-media-link').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('update-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('update-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
