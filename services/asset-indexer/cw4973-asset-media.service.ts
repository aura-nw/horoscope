/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import moleculer, { CallingOptions, Context, ServiceBroker } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Types } from 'mongoose';
import { QueryOptions } from 'moleculer-db';
import { Job } from 'bull';
import { ObjectId } from 'bson';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbCW4973MediaLinkMixin } from '../../mixins/dbMixinMongoose';

import { Config } from '../../common';
import {
	CONTRACT_TYPE,
	CW4973_MANAGER_ACTION,
	CW4973_MEDIA_MANAGER_ACTION,
	LIST_NETWORK,
	MEDIA_STATUS,
} from '../../common/constant';
const _callApiMixin = new CallApiMixin().start();
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = parseInt(Config.CACHER_INDEXER_TTL);
const opts: CallingOptions = { timeout: 0, retries: MAX_RETRY_REQ };

const GET_MEDIA_LINK_PREFIX = 'get_media_link';

import { queueConfig } from '../../config/queue';
import { CW4973AssetEntity } from '../../entities/cw4973-asset.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW4973-media',
	version: 1,
	mixins: [
		_callApiMixin,
		dbCW4973MediaLinkMixin,
		queueService(queueConfig.redis, queueConfig.opts),
	],
	queues: {
		'CW4973-media.get-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_GET_MEDIA_LINK, 10),
			async process(job: Job) {
				// @ts-ignore
				this.logger.debug('get-media-link param: ', JSON.stringify(job.data));
				const uri = job.data.uri;
				const file_name = job.data.file_name;
				const media_link_key = job.data.media_link_key;
				const chain_id = job.data.chain_id;
				const type = job.data.type;
				const cacheKey = job.data.cacheKey;
				const field = job.data.field;
				const sourceUri = job.data.sourceUri;
				const cw4973_id = job.data.cw4973_id;
				job.progress(10);
				// @ts-ignore
				// Await this.getMediaLink(uri, type, file_name, media_link_key, chain_id);
				// @ts-ignore
				const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

				if (!processingFlag) {
					try {
						// @ts-ignore
						await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
						// @ts-ignore
						// Let locked = await this.broker.cacher?.tryLock(
						// 	CacheKey,
						// 	CACHER_INDEXER_TTL,
						// );
						// @ts-ignore
						try {
							// @ts-ignore
							await this.getMediaLink(
								sourceUri,
								uri,
								type,
								file_name,
								media_link_key,
								chain_id,
								field,
								cw4973_id,
							);
						} catch (error) {
							// @ts-ignore
							this.logger.error('getMediaLink error', media_link_key, error);
						}
						// @ts-ignore
						await this.broker.cacher?.del(cacheKey);
						// @ts-ignore
						// Await locked();
						// @ts-ignore
						this.logger.info('getMediaLink locked', media_link_key);
						// Await this.unlock(cacheKey);
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
		'CW4973-media.migrate-old-data': {
			concurrency: 1,
			async process(job: Job) {
				const chain_id = job.data.chain_id;
				// @ts-ignore
				this.handleMigrateOldData(chain_id);
			},
		},
	},
	events: {
		'CW4973-media.get-media-link': {
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const file_name = ctx.params.file_name;
				const media_link_key = ctx.params.media_link_key;
				const chain_id = ctx.params.chain_id;
				const type = ctx.params.type;
				const field = ctx.params.field;
				const cw4973_id = ctx.params.cw4973_id;
				const sourceUri = ctx.params.sourceUri;
				const cacheKey = `${GET_MEDIA_LINK_PREFIX}_${type}_${field}_${media_link_key}_${cw4973_id}`;
				// @ts-ignore
				// This.logger.info("this.broker.cacher",util.inspect(this.broker.cacher));
				// @ts-ignore
				this.logger.debug(
					'get-media-link ctx.params',
					uri,
					media_link_key,
					CONTRACT_TYPE.CW4973,
				);

				// @ts-ignore
				const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

				if (!processingFlag) {
					try {
						// @ts-ignore
						await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
						// @ts-ignore
						// Let locked = await this.broker.cacher?.tryLock(cacheKey);
						// @ts-ignore
						try {
							// @ts-ignore
							// Await this.getMediaLink(uri, file_name, media_link_key);

							// @ts-ignore
							this.createJob(
								'CW4973-media.get-media-link',
								{
									uri,
									file_name,
									type,
									media_link_key,
									chain_id,
									cacheKey,
									cw4973_id,
									field,
									sourceUri,
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
						// Await locked();
						// @ts-ignore
						// This.logger.info('getMediaLink locked', media_link_key);
						// Await this.unlock(cacheKey);
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
		sourceUri: string,
		uri: string,
		type: string,
		file_name: string,
		key: string,
		chain_id: string,
		field: string,
		cw4973_id: string,
	) {
		this.logger.info('getMediaLink', uri, file_name, key);
		const query: QueryOptions = { 'custom_info.chain_id': chain_id, source: sourceUri };
		const media: any[] = await this.broker.call(CW4973_MEDIA_MANAGER_ACTION.FIND, { query });
		this.logger.debug('media', media);

		if (media.length === 0) {
			await this.broker.call(CW4973_MEDIA_MANAGER_ACTION.INSERT, {
				_id: new Types.ObjectId(),
				key,
				source: sourceUri,
				media_link: '',
				status: MEDIA_STATUS.HANDLING,
				chainId: chain_id,
			});
			await this.broker.call(
				CW4973_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
				{ uri, file_name, type, key, chainId: chain_id, field, sourceUri },
				opts,
			);
		} else {
			const queryAssetCW4973: any = {};
			queryAssetCW4973._id = new ObjectId(cw4973_id);
			queryAssetCW4973['custom_info.chain_id'] = chain_id;

			if (media[0].status == MEDIA_STATUS.COMPLETED) {
				const listFoundCW4973: CW4973AssetEntity[] = await this.broker.call(
					CW4973_MANAGER_ACTION.FIND,
					{
						query: queryAssetCW4973,
					},
					{ meta: { $cache: false } },
				);
				if (listFoundCW4973 && listFoundCW4973.length > 0) {
					listFoundCW4973.map((CW4973: CW4973AssetEntity) => {
						this.logger.debug('CW4973 update: ', JSON.stringify(CW4973));
						if (CW4973?.metadata?.image == sourceUri) {
							CW4973.image = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
							};
							this.broker.call('v1.CW4973-asset-manager.act-update-by-id', {
								obj: CW4973,
								updateOperator: {
									$set: {
										image: {
											link_s3: media[0].media_link,
											content_type: media[0].content_type,
										},
									},
								},
							});
						}
						if (CW4973?.metadata?.animation_url == sourceUri) {
							CW4973.animation = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
							};

							this.broker.call('v1.CW4973-asset-manager.act-update-by-id', {
								obj: CW4973,
								updateOperator: {
									$set: {
										animation: {
											link_s3: media[0].media_link,
											content_type: media[0].content_type,
										},
									},
								},
							});
						}
						// This.broker.call(CW4973_MANAGER_ACTION.UPSERT, CW4973);
						this.logger.info(CW4973);
					});
				}
			}
		}
	}

	async handleMigrateOldData(chainId: string) {
		const network = LIST_NETWORK.find((x) => x.chainId == chainId);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}
		const listMedia = await this.adapter.find({});
		const listBulk: any[] = [];
		listMedia.map(async (media: any) => {
			if (media.key && media.status == 'COMPLETED') {
				const listCw4973: any[] = await this.broker.call(
					'v1.CW4973-asset-manager.act-find',
					{
						query: {
							'custom_info.chain_id': chainId,
							media_link: media.key,
						},
					},
					{ timeout: 0 },
				);
				listCw4973.map(async (cw4973: any) => {
					const imageLink = cw4973?.asset_info?.data?.info?.extension?.image;
					// Let result = await this.adapter.updateById(media._id, {
					// 	$set: { source: imageLink },
					// });
					if (imageLink) {
						const result = await this.adapter.updateById(media._id, {
							$set: { source: imageLink },
						});
						this.logger.info('result update: ', result);
					}
					// ListBulk.push({
					// 	UpdateOne: {
					// 		Filter: {
					// 			_id: media._id,
					// 		},
					// 		Update: {
					// 			$set: { source: imageLink },
					// 		},
					// 	},
					// });
					// This.logger.info('result update: ', result);
				});
				const result = await this.adapter.bulkWrite(listBulk);
				this.logger.info(result);
			}
		});
	}
	async _start(): Promise<void> {
		// @ts-ignore
		// This.createJob(
		// 	'CW4973-media.migrate-old-data',
		// 	{
		// 		Chain_id: 'euphoria-1',
		// 	},
		// 	{
		// 		RemoveOnComplete: true,
		// 		RemoveOnFail: {
		// 			Count: 3,
		// 		},
		// 		// attempts: 5,
		// 		// backoff: 5000,
		// 	},
		// );
		this.getQueue('CW4973-media.get-media-link').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW4973-media.get-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW4973-media.get-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
export class CW721AssetMedia {}
