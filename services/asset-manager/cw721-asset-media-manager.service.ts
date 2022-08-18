/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { CallingOptions, Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Common } from '@MicroServices/asset-indexer/common.service';
import { MediaStatus } from 'model/cw721-asset-media.model';
import { CW721_MEDIA_MANAGER_ACTION } from '../../common/constant';
import { Config } from '../../common';
import { Job } from 'bull';
import { RedisService } from 'utils/redis';
const QueueService = require('moleculer-bull');

const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
// const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

@Service({
	name: 'CW721-asset-media-manager',
	mixins: [
		QueueService(
			`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
			{
				prefix: 'insert.asset',
			},
		),
		dbCW721MediaLinkMixin,
	],
	queues: {
		'insert.asset': {
			concurrency: 1,
			async process(job: Job) {
				job.progress(10);
				// @ts-ignore
				await this.insertIntoMongo();
			},
		},
	},
	version: 1,
	broker: {},
	actions: {
		'act-insert': {
			async handler(ctx: Context): Promise<any> {
				// @ts-ignore
				this.logger.debug(
					`ctx.params CW721-asset-media-manager insert ${JSON.stringify(ctx.params)}`,
				);
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
			cache: { ttl: 10 },
			async handler(ctx: Context): Promise<any> {
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
				// @ts-ignore
				this.logger.debug('update-media-link ctx.params', uri, file_name, key);
				// @ts-ignore
				await this.updateMediaLink(uri, file_name, key);
			},
		},
		'act-insert-stream': {
			async handler(ctx: Context<any>) {
				// @ts-ignore
				this.logger.debug(
					`ctx.params CW721-asset-media-manager insert ${JSON.stringify(ctx.params)}`,
				);
				// @ts-ignore
				await this.insertAssetMediaIntoStream(
					ctx.params.uri,
					ctx.params.file_name,
					ctx.params.key,
				);
			},
		},
	},
})
export default class CW721AssetMediaManagerService extends moleculer.Service {
	async upsert_handler(asset_media: any) {
		this.logger.debug(`asset `, asset_media);
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

	async updateMediaLink(uri: string, file_name: string, key: string) {
		try {
			// this.logger.info("updateMediaLink", uri, key);
			const linkS3 = await Common.handleUri(uri, file_name);
			// this.logger.info("linkS3", linkS3);
			await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
				key,
				media_link: linkS3,
				status: MediaStatus.COMPLETED,
			});
		} catch (err: any) {
			this.logger.error('error', uri, key, err);
			switch (err.error?.code) {
				case 'ETIMEDOUT':
					await this.broker.call(
						CW721_MEDIA_MANAGER_ACTION.UPSERT,
						{
							key,
							media_link: '',
							status: MediaStatus.PENDING,
						},
						OPTs,
					);
					break;
				default:
					await this.broker.call(
						CW721_MEDIA_MANAGER_ACTION.UPSERT,
						{
							key,
							media_link: '',
							status: MediaStatus.ERROR,
						},
						OPTs,
					);
					break;
			}
		}
	}

	async insertAssetMediaIntoStream(uri: string, file_name: string, key: string) {
		try {
			this.logger.debug(`Insert media asset into stream`, uri, file_name, key);

			let assetJson = {
				assetUri: uri,
				assetFileName: file_name,
				assetKey: key,
			};

			let redisService = new RedisService();

			await redisService.addMessageToStream(JSON.stringify(assetJson));
		} catch (error) {
			this.logger.error(error);
		}
	}

	async insertIntoMongo() {
		try {
			let redisService = new RedisService();

			let assetArr = await redisService.readMessageFromStream();

			this.logger.info(assetArr);
		} catch (error) {}
	}
	async _start() {
		this.createJob(
			'insert.asset',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_BLOCK, 10),
				},
			},
		);
		this.getQueue('insert.asset').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('insert.asset').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('insert.asset').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
