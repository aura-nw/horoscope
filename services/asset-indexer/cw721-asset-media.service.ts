/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
// import { lockCacherMixin } from '../../mixins/lockCacher/lock.mixin';
import moleculer, { CallingOptions, Context, ServiceBroker } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { MediaStatus } from '../../model/cw721-asset-media.model';
import { Config } from '../../common';
import { Types } from 'mongoose';
import { CONTRACT_TYPE, CW721_MEDIA_MANAGER_ACTION } from '../../common/constant';
import { QueryOptions } from 'moleculer-db';
import { Common } from './common.service';
// import { RedisClientType, commandOptions } from '@redis/client';
var util = require('util');
import { toBase64, toUtf8 } from '@cosmjs/encoding';
const callApiMixin = new CallApiMixin().start();
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = parseInt(Config.CACHER_INDEXER_TTL);
const OPTs: CallingOptions = { timeout: 0, retries: MAX_RETRY_REQ };

const GET_MEDIA_LINK_PREFIX = 'get_media_link';

import { QueueConfig } from '../../config/queue';
import { Job } from 'bull';
const QueueService = require('moleculer-bull');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721-media',
	version: 1,
	mixins: [
		callApiMixin,
		dbCW721MediaLinkMixin,
		QueueService(QueueConfig.redis, QueueConfig.opts),
	],
	queues: {
		'CW721-media.get-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_GET_MEDIA_LINK, 10),
			async process(job: Job) {
				const uri = job.data.uri;
				const file_name = job.data.file_name;
				const media_link_key = job.data.media_link_key;
				const chain_id = job.data.chain_id;
				const type = job.data.type;
				const metadata = job.data.metadata;
				const cacheKey = `${GET_MEDIA_LINK_PREFIX}_${media_link_key}`;

				job.progress(10);
				// @ts-ignore
				// await this.getMediaLink(uri, type, file_name, media_link_key, chain_id);
				// @ts-ignore
				const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

				if (!processingFlag) {
					try {
						// @ts-ignore
						await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
						// @ts-ignore
						// let locked = await this.broker.cacher?.tryLock(
						// 	cacheKey,
						// 	CACHER_INDEXER_TTL,
						// );
						// @ts-ignore
						try {
							// @ts-ignore
							await this.getMediaLink(
								uri,
								type,
								file_name,
								media_link_key,
								chain_id,
								metadata,
							);
						} catch (error) {
							// @ts-ignore
							this.logger.error('getMediaLink error', media_link_key, error);
						}
						// @ts-ignore
						await this.broker.cacher?.del(cacheKey);
						// @ts-ignore
						// await locked();
						// @ts-ignore
						this.logger.info('getMediaLink locked', media_link_key);
						// await this.unlock(cacheKey);
						// }
					} catch (e) {
						// @ts-ignore
						this.logger.warn('tryLock error', cacheKey);
					}
				}
				job.progress(100);
				return true;
			},
		},
	},
	events: {
		'CW721-media.get-media-link': {
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const file_name = ctx.params.file_name;
				const media_link_key = ctx.params.media_link_key;
				const chain_id = ctx.params.chain_id;
				const type = ctx.params.type;
				const cacheKey = `${GET_MEDIA_LINK_PREFIX}_${media_link_key}`;
				const metadata = ctx.params.metadata;
				// @ts-ignore
				// this.logger.info("this.broker.cacher",util.inspect(this.broker.cacher));
				// @ts-ignore
				this.logger.debug(
					'get-media-link ctx.params',
					uri,
					media_link_key,
					CONTRACT_TYPE.CW721,
				);
				// test create job without redlock
				// try {
				// 	// @ts-ignore
				// 	// await this.getMediaLink(uri, file_name, media_link_key);

				// 	//@ts-ignore
				// 	this.createJob(
				// 		'get-media-link',
				// 		{
				// 			uri,
				// 			file_name,
				// 			media_link_key,
				// 			chain_id,
				// 			cacheKey,
				// 		},
				// 		{
				// 			removeOnComplete: true,
				// 			removeOnFail: {
				// 				count: 3,
				// 			},
				// 		},
				// 	);
				// } catch (error) {
				// 	// @ts-ignore
				// 	this.logger.error('create job getMediaLink error', media_link_key, error);
				// }

				// // @ts-ignore
				// await this.getMediaLink(uri, file_name, media_link_key, chain_id);
				// @ts-ignore
				const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

				if (!processingFlag) {
					try {
						// @ts-ignore
						await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
						// @ts-ignore
						// let locked = await this.broker.cacher?.tryLock(cacheKey);
						// @ts-ignore
						try {
							// @ts-ignore
							// await this.getMediaLink(uri, file_name, media_link_key);

							//@ts-ignore
							this.createJob(
								'CW721-media.get-media-link',
								{
									uri,
									file_name,
									type,
									media_link_key,
									chain_id,
									cacheKey,
									metadata,
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
						} catch (error) {
							// @ts-ignore
							this.logger.error('getMediaLink error', media_link_key, error);
						}
						// @ts-ignore
						await this.broker.cacher?.del(cacheKey);
						// @ts-ignore
						await locked();
						// @ts-ignore
						// this.logger.info('getMediaLink locked', media_link_key);
						// await this.unlock(cacheKey);
						// }
					} catch (e) {
						// @ts-ignore
						this.logger.warn('tryLock error', cacheKey);
					}
				}
			},
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	async getMediaLink(
		uri: string,
		type: string,
		file_name: string,
		key: string,
		chain_id: string,
		metadata: string,
	) {
		this.logger.info('getMediaLink', uri, file_name, key);
		let query: QueryOptions = { key, 'custom_info.chain_id': chain_id };
		const media: any[] = await this.broker.call(
			CW721_MEDIA_MANAGER_ACTION.FIND,
			{ query },
			OPTs,
		);
		this.logger.debug('media', media);

		if (media.length === 0) {
			await this.broker.call(
				CW721_MEDIA_MANAGER_ACTION.INSERT,
				{
					_id: new Types.ObjectId(),
					key,
					media_link: '',
					status: MediaStatus.HANDLING,
					chainId: chain_id,
					metadata,
				},
				OPTs,
			);
			await this.broker.call(
				CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
				{ uri, file_name, type, key, chainId: chain_id },
				OPTs,
			);
		} else {
			switch (media[0].status) {
				case MediaStatus.PENDING: {
					await this.broker.call(
						CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
						{ uri, file_name, key, chainId: chain_id },
						OPTs,
					);
					break;
				}
				case MediaStatus.COMPLETED:
					// do nothing
					break;
				case MediaStatus.HANDLING:
					// do nothing
					break;
				case MediaStatus.ERROR:
					// do nothing
					break;
			}
		}
	}

	async _start(): Promise<void> {
		// let uri =
		// 	'ipfs://bafybeid6su5bvoiah5e5nree7p53kjoti3x6hcjmoql4guhvb25njxe52i/mohamed-nohassi-odxB5oIG_iA-unsplash.jpg';
		// let key = Common.getKeyFromUri(uri);
		// let result = await Common.handleUri(key[0], key[1]);
		// this.logger.info('result: ', result);

		// let urlGetListToken = `contract/address/smart/${toBase64(
		// 	toUtf8(`{"all_tokens":{"limit":100}}`),
		// )}`;
		this.getQueue('CW721-media.get-media-link').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW721-media.get-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW721-media.get-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
export class CW721AssetMedia {}
