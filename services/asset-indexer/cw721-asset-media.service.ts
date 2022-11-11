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
import {
	CONTRACT_TYPE,
	CW721_FIELD,
	CW721_MANAGER_ACTION,
	CW721_MEDIA_MANAGER_ACTION,
	LIST_NETWORK,
} from '../../common/constant';
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
import { CW721AssetEntity } from '../../entities/cw721-asset.entity';
import { ObjectId } from 'bson';
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
				const cacheKey = job.data.cacheKey;
				const field = job.data.field;
				const sourceUri = job.data.sourceUri;
				const cw721_id = job.data.cw721_id;
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
								sourceUri,
								uri,
								type,
								file_name,
								media_link_key,
								chain_id,
								field,
								cw721_id,
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
		'CW721-media.migrate-old-data': {
			concurrency: 1,
			async process(job: Job) {
				const chain_id = job.data.chain_id;
				//@ts-ignore
				this.handleMigrateOldData(chain_id);
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
				const field = ctx.params.field;
				const cacheKey = `${GET_MEDIA_LINK_PREFIX}_${type}_${field}_${media_link_key}`;
				const cw721_id = ctx.params.cw721_id;
				const sourceUri = ctx.params.sourceUri;
				// @ts-ignore
				// this.logger.info("this.broker.cacher",util.inspect(this.broker.cacher));
				// @ts-ignore
				this.logger.debug(
					'get-media-link ctx.params',
					uri,
					media_link_key,
					CONTRACT_TYPE.CW721,
				);

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
									cw721_id,
									field,
									sourceUri: sourceUri,
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
						// await locked();
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
		sourceUri: string,
		uri: string,
		type: string,
		file_name: string,
		key: string,
		chain_id: string,
		field: string,
		cw721_id: string,
	) {
		this.logger.info('getMediaLink', uri, file_name, key);
		let query: QueryOptions = { 'custom_info.chain_id': chain_id, source: sourceUri };
		const media: any[] = await this.broker.call(CW721_MEDIA_MANAGER_ACTION.FIND, { query });
		this.logger.debug('media', media);

		if (media.length === 0) {
			await this.broker.call(CW721_MEDIA_MANAGER_ACTION.INSERT, {
				_id: new Types.ObjectId(),
				key,
				source: sourceUri,
				media_link: '',
				status: MediaStatus.HANDLING,
				chainId: chain_id,
			});
			await this.broker.call(
				CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
				{ uri, file_name, type, key, chainId: chain_id, field, sourceUri },
				OPTs,
			);
		} else {
			let queryAssetCW721: any = {};
			queryAssetCW721['_id'] = new ObjectId(cw721_id);
			queryAssetCW721['custom_info.chain_id'] = chain_id;

			if (media[0].status == MediaStatus.COMPLETED) {
				let listFoundCW721: CW721AssetEntity[] = await this.broker.call(
					CW721_MANAGER_ACTION.FIND,
					{
						query: queryAssetCW721,
					},
				);
				if (listFoundCW721 && listFoundCW721.length > 0) {
					listFoundCW721.map((CW721: CW721AssetEntity) => {
						this.logger.debug('CW721 update: ', JSON.stringify(CW721));
						if (CW721?.metadata?.image == sourceUri) {
							CW721.image = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
							};
							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: CW721,
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
						if (CW721?.metadata?.animation_url == sourceUri) {
							CW721.animation = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
							};

							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: CW721,
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
						// this.broker.call(CW721_MANAGER_ACTION.UPSERT, CW721);
						this.logger.info(CW721);
					});
				}
			}
		}

		// if (media.length === 0) {
		// 	await this.broker.call(CW721_MEDIA_MANAGER_ACTION.INSERT, {
		// 		_id: new Types.ObjectId(),
		// 		key,
		// 		source: sourceUri,
		// 		media_link: '',
		// 		status: MediaStatus.HANDLING,
		// 		chainId: chain_id,
		// 	});
		// 	await this.broker.call(
		// 		CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
		// 		{ uri, file_name, type, key, chainId: chain_id, field, sourceUri },
		// 		OPTs,
		// 	);
		// } else {
		// 	switch (media[0].status) {
		// 		case MediaStatus.PENDING: {
		// 			await this.broker.call(
		// 				CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
		// 				{ uri, file_name, type, key, chainId: chain_id, field, sourceUri },
		// 				OPTs,
		// 			);
		// 			break;
		// 		}
		// 		case MediaStatus.COMPLETED:
		// 			// do nothing
		// 			break;
		// 		case MediaStatus.HANDLING:
		// 			// do nothing
		// 			break;
		// 		case MediaStatus.ERROR:
		// 			// do nothing
		// 			break;
		// 	}
		// }
	}

	async handleMigrateOldData(chainId: string) {
		const network = LIST_NETWORK.find((x) => x.chainId == chainId);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}
		let listMedia = await this.adapter.find({});
		let listBulk: any[] = [];
		listMedia.map(async (media: any) => {
			if (media.key && media.status == 'COMPLETED') {
				let listCw721: any[] = await this.broker.call(
					'v1.CW721-asset-manager.act-find',
					{
						query: {
							'custom_info.chain_id': chainId,
							media_link: media.key,
						},
					},
					{ timeout: 0 },
				);
				listCw721.map(async (cw721: any) => {
					let imageLink = cw721?.asset_info?.data?.info?.extension?.image;
					// let result = await this.adapter.updateById(media._id, {
					// 	$set: { source: imageLink },
					// });
					if (imageLink) {
						let result = await this.adapter.updateById(media._id, {
							$set: { source: imageLink },
						});
						this.logger.info('result update: ', result);
					}
					// listBulk.push({
					// 	updateOne: {
					// 		filter: {
					// 			_id: media._id,
					// 		},
					// 		update: {
					// 			$set: { source: imageLink },
					// 		},
					// 	},
					// });
					// this.logger.info('result update: ', result);
				});
				let result = await this.adapter.bulkWrite(listBulk);
				this.logger.info(result);
			}
		});
	}
	async _start(): Promise<void> {
		//@ts-ignore
		// this.createJob(
		// 	'CW721-media.migrate-old-data',
		// 	{
		// 		chain_id: 'euphoria-1',
		// 	},
		// 	{
		// 		removeOnComplete: true,
		// 		removeOnFail: {
		// 			count: 3,
		// 		},
		// 		// attempts: 5,
		// 		// backoff: 5000,
		// 	},
		// );
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
