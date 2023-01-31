/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable max-classes-per-file */
'use strict';

import moleculer, { CallingOptions, Context } from 'moleculer';
import { Event, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Types } from 'mongoose';
import { QueryOptions } from 'moleculer-db';
import { Job } from 'bull';
import { ObjectId } from 'bson';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import {
	CONTRACT_TYPE,
	CW721_MANAGER_ACTION,
	CW721_MEDIA_MANAGER_ACTION,
	LIST_NETWORK,
	MEDIA_STATUS,
} from '../../common/constant';
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = parseInt(Config.CACHER_INDEXER_TTL, 10);
const opts: CallingOptions = { timeout: 0, retries: MAX_RETRY_REQ };

const GET_MEDIA_LINK_PREFIX = 'get_media_link';

import { queueConfig } from '../../config/queue';
import { CW721AssetEntity } from '../../entities/cw721-asset.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721-media',
	version: 1,
	mixins: [dbCW721MediaLinkMixin, queueService(queueConfig.redis, queueConfig.opts)],
	queues: {
		'CW721-media.get-media-link': {
			concurrency: parseInt(Config.CONCURRENCY_GET_MEDIA_LINK, 10),
			async process(job: Job) {
				// @ts-ignore
				this.logger.debug('get-media-link param: ', JSON.stringify(job.data));
				const uri = job.data.uri;
				const fileName = job.data.fileName;
				const mediaLinkKey = job.data.mediaLinkKey;
				const chainId = job.data.chainId;
				const type = job.data.type;
				const cacheKey = job.data.cacheKey;
				const field = job.data.field;
				const sourceUri = job.data.sourceUri;
				const cw721Id = job.data.cw721Id;
				job.progress(10);
				// @ts-ignore
				const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

				if (!processingFlag) {
					try {
						// @ts-ignore
						await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);

						try {
							// @ts-ignore
							await this.getMediaLink(
								sourceUri,
								uri,
								type,
								fileName,
								mediaLinkKey,
								chainId,
								field,
								cw721Id,
							);
						} catch (error) {
							// @ts-ignore
							this.logger.error('getMediaLink error', mediaLinkKey, error);
						}
						// @ts-ignore
						await this.broker.cacher?.del(cacheKey);
						// @ts-ignore
						// Await locked();
						// @ts-ignore
						this.logger.info('getMediaLink locked', mediaLinkKey);
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
		'CW721-media.migrate-old-data': {
			concurrency: 1,
			async process(job: Job) {
				const chainId = job.data.chainId;
				// @ts-ignore
				this.handleMigrateOldData(chainId);
			},
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {
	@Event({ name: 'CW721-media.get-media-link' })
	async handleCW721MediaGetMediaLink(ctx: Context<any>) {
		const uri = ctx.params.uri;
		const fileName = ctx.params.fileName;
		const mediaLinkKey = ctx.params.mediaLinkKey;
		const chainId = ctx.params.chainId;
		const type = ctx.params.type;
		const field = ctx.params.field;
		const cw721Id = ctx.params.cw721Id;
		const sourceUri = ctx.params.sourceUri;
		const cacheKey = `${GET_MEDIA_LINK_PREFIX}_${type}_${field}_${mediaLinkKey}_${cw721Id}`;

		this.logger.debug('get-media-link ctx.params', uri, mediaLinkKey, CONTRACT_TYPE.CW721);

		const processingFlag = (await this.broker.cacher?.get(cacheKey)) ? true : false;

		if (!processingFlag) {
			try {
				await this.broker.cacher?.set(cacheKey, true, CACHER_INDEXER_TTL);
				try {
					this.createJob(
						'CW721-media.get-media-link',
						{
							uri,
							fileName,
							type,
							mediaLinkKey,
							chainId,
							cacheKey,
							cw721Id,
							field,
							sourceUri,
						},
						{
							removeOnComplete: true,
							removeOnFail: {
								count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
							},
							attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
							backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
						},
					);
				} catch (error) {
					this.logger.error('getMediaLink error', mediaLinkKey, error);
				}
				await this.broker.cacher?.del(cacheKey);
			} catch (e) {
				this.logger.warn('tryLock error', cacheKey);
			}
		}
	}
	async getMediaLink(
		sourceUri: string,
		uri: string,
		type: string,
		fileName: string,
		key: string,
		chainId: string,
		field: string,
		cw721Id: string,
	) {
		this.logger.info('getMediaLink', uri, fileName, key);
		// eslint-disable-next-line quote-props
		const query: QueryOptions = { source: sourceUri, 'custom_info.chain_id': chainId };
		const media: any[] = await this.broker.call(CW721_MEDIA_MANAGER_ACTION.FIND, { query });
		this.logger.debug('media', media);

		if (media.length === 0) {
			await this.broker.call(CW721_MEDIA_MANAGER_ACTION.INSERT, {
				_id: new Types.ObjectId(),
				key,
				source: sourceUri,
				// eslint-disable-next-line camelcase
				media_link: '',
				status: MEDIA_STATUS.HANDLING,
				chainId,
			});
			await this.broker.call(
				CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK,
				{ uri, fileName, type, key, chainId, field, sourceUri },
				opts,
			);
		} else {
			const queryAssetCW721: any = {};
			// eslint-disable-next-line no-underscore-dangle
			queryAssetCW721._id = new ObjectId(cw721Id);
			queryAssetCW721['custom_info.chain_id'] = chainId;

			if (media[0].status === MEDIA_STATUS.COMPLETED) {
				const listFoundCW721: CW721AssetEntity[] = await this.broker.call(
					CW721_MANAGER_ACTION.FIND,
					{
						query: queryAssetCW721,
					},
					{ meta: { $cache: false } },
				);
				if (listFoundCW721 && listFoundCW721.length > 0) {
					/* eslint-disable camelcase */
					listFoundCW721.map((cw721: CW721AssetEntity) => {
						this.logger.debug('CW721 update: ', JSON.stringify(cw721));
						if (cw721?.metadata?.image === sourceUri) {
							cw721.image = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
								file_path: media[0].file_path,
							};
							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: cw721,
								updateOperator: {
									$set: {
										image: {
											link_s3: media[0].media_link,
											content_type: media[0].content_type,
											file_path: media[0].file_path,
										},
									},
								},
							});
						}
						if (cw721?.metadata?.animation_url === sourceUri) {
							cw721.animation = {
								link_s3: media[0].media_link,
								content_type: media[0].content_type,
								file_path: media[0].file_path,
							};

							this.broker.call('v1.CW721-asset-manager.act-update-by-id', {
								obj: cw721,
								updateOperator: {
									$set: {
										animation: {
											link_s3: media[0].media_link,
											content_type: media[0].content_type,
											file_path: media[0].file_path,
										},
									},
								},
							});
						}
						/* eslint-enable camelcase */
						this.logger.info(cw721);
					});
				}
			}
		}
	}

	async handleMigrateOldData(chainId: string) {
		const network = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (network && network.databaseName) {
			// @ts-ignore
			this.adapter.useDb(network.databaseName);
		}
		const listMedia = await this.adapter.find({});
		listMedia.map(async (media: any) => {
			if (media.key && media.status === 'COMPLETED') {
				const listCw721: any[] = await this.broker.call(
					'v1.CW721-asset-manager.act-find',
					{
						query: {
							'custom_info.chain_id': chainId,
							// eslint-disable-next-line quote-props, camelcase
							media_link: media.key,
						},
					},
					{ timeout: 0 },
				);
				listCw721.map(async (cw721: any) => {
					const imageLink = cw721?.asset_info?.data?.info?.extension?.image;
					// Let result = await this.adapter.updateById(media._id, {
					// 	$set: { source: imageLink },
					// });
					if (imageLink) {
						// eslint-disable-next-line no-underscore-dangle
						const result = await this.adapter.updateById(media._id, {
							$set: { source: imageLink },
						});
						this.logger.info('result update: ', result);
					}
				});
			}
		});
	}
	async _start(): Promise<void> {
		// @ts-ignore
		// This.createJob(
		// 	'CW721-media.migrate-old-data',
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
		this.getQueue('CW721-media.get-media-link').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('CW721-media.get-media-link').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('CW721-media.get-media-link').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
export class CW721AssetMedia {}
