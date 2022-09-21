/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import moleculer, { CallingOptions, Context } from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { Common } from '../asset-indexer/common.service';
import { MediaStatus } from '../../model/cw721-asset-media.model';
import { CW721_MEDIA_MANAGER_ACTION } from '../../common/constant';
import { Config } from '../../common';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Job } from 'bull';
import { S3Service } from '../../utils/s3';
const QueueService = require('moleculer-bull');
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
// const CACHER_INDEXER_TTL = Config.CACHER_INDEXER_TTL;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };
const callApiMixin = new CallApiMixin().start();
@Service({
	name: 'CW721-asset-media-manager',
	mixins: [
		dbCW721MediaLinkMixin,
		callApiMixin,
		QueueService(
			`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
			{
				prefix: 'cw721.asset-media',
			},
		),
	],
	queues: {
		'upload-ipfs-to-s3': {
			concurrency: 1,
			async process(job: Job) {
				job.progress(10);
				// @ts-ignore
				await this.handleJobUploadIPFSToS3(
					job.data.uri,
					job.data.file_name,
					job.data.key,
					job.data.hostname,
					job.data.path,
				);
				job.progress(100);
				return true;
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
				const hostname = ctx.params.hostname;
				const path = ctx.params.path;
				// @ts-ignore
				this.logger.debug('update-media-link ctx.params', uri, file_name, key);
				// @ts-ignore
				await this.updateMediaLink(uri, file_name, key, hostname, path);
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

	async updateMediaLink(
		uri: string,
		file_name: string,
		key: string,
		hostname: string,
		path: string,
	) {
		try {
			this.createJob(
				'upload-ipfs-to-s3',
				{
					uri,
					file_name,
					key,
					hostname,
					path,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
					repeat: {
						every: parseInt(Config.MILISECOND_CRAWL_SUPPLY, 10),
					},
				},
			);

			// // this.logger.info("updateMediaLink", uri, key);
			// const linkS3 = await this.handleUri(uri, file_name);
			// // this.logger.info("linkS3", linkS3);
			// await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPSERT, {
			// 	key,
			// 	media_link: linkS3,
			// 	status: MediaStatus.COMPLETED,
			// });
		} catch (err: any) {
			this.logger.error('error', uri, key, err);
			if (err.error?.code) {
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
			if (err.statusCode) {
				switch (err.statusCode) {
					case '504':
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
	}

	s3Client = new S3Service().connectS3();
	BUCKET = Config.BUCKET;
	public async handleJobUploadIPFSToS3(
		uri: string,
		file_name: string,
		key: string,
		hostname: string,
		path: string,
	) {
		const responseFromIPFS = await this.callApiFromDomain([hostname], path);
		const contentType = responseFromIPFS.headers['content-type'];
		if (Common.checkFileTypeInvalid(contentType)) {
			let result = await this.s3Client.putObject({
				Body: responseFromIPFS.data,
				Key: file_name,
				Bucket: this.BUCKET,
				ContentType: contentType,
			});
			this.logger.info(result);
		}
	}
	public handleUri = async (uri: string, file_name: string) => {
		let errcode = 0;
		if (Common.validURI(uri)) {
			// var _include_headers = function (
			// 	body: any,
			// 	response: { headers: any },
			// 	resolveWithFullResponse: any,
			// ) {
			// 	return { headers: response.headers, data: body };
			// };
			// var options = {
			// 	uri,
			// 	encoding: null,
			// 	json: true,
			// 	transform: _include_headers,
			// 	resolveWithFullResponse: true,
			// 	timeout: REQUEST_IPFS_TIMEOUT,
			// };
			// const rs = new Promise(async (resolve, reject) => {
			// 	request(options)
			// 		.then(function (response: any) {
			// 			const contentType = response.headers['content-type'];
			// 			if (Common.checkFileTypeInvalid(contentType)) {
			// 				s3Client.putObject(
			// 					{
			// 						Body: response.data,
			// 						Key: file_name,
			// 						Bucket: BUCKET,
			// 						ContentType: contentType,
			// 					},
			// 					function (error: any) {
			// 						if (error) {
			// 							reject(error);
			// 						} else {
			// 							const linkS3 = `https://${BUCKET}.s3.amazonaws.com/${file_name}`;
			// 							resolve(linkS3);
			// 						}
			// 					},
			// 				);
			// 			}
			// 		})
			// 		.catch(function (err: any) {
			// 			errcode = err.error.code;
			// 			reject(err);
			// 		});
			// });
			// return rs;
		} else {
			throw new Error('InvalidURI');
		}
	};
}
