/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import moleculer, { CallingOptions, Context, ServiceBroker } from 'moleculer';
import { Action, Get, Post, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbCW721MediaLinkMixin } from '../../mixins/dbMixinMongoose';
import { MediaStatus } from '../../model/cw721-asset-media.model';
import { Config } from '../../common';
import { Types } from "mongoose";
import { CONTRACT_TYPE, CW721_MEDIA_MANAGER_ACTION } from '../../common/constant';
import { Common } from './common.service';
import { QueryOptions } from 'moleculer-db';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType, commandOptions } from '@redis/client';

const redisMixin = new RedisMixin().start();
const callApiMixin = new CallApiMixin().start();
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const CACHER_INDEXER_TTL = parseInt(Config.CACHER_INDEXER_TTL);
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

const GET_MEDIA_LINK_PREFIX = "get_media_link";

const broker = new ServiceBroker({
	cacher: {
		type: "Redis",
		options: {
			// Prefix for keys
			prefix: "MOL",
			// set Time-to-live to 30sec.
			ttl: 30,
			// Turns Redis client monitoring on.
			// monitor: false,
			// Redis settings
			// redis: {
			//   host: "redis-server",
			//   port: 6379,
			//   password: "1234",
			//   db: 0
			// },
			lock: {
				ttl: 15, //the maximum amount of time you want the resource locked in seconds
				staleTime: 10, // If the TTL is less than this number, means that the resources are staled
			},
			// Redlock settings
			redlock: {
				// Redis clients. Support node-redis or ioredis. By default will use the local client.
				//   clients: [client1, client2, client3],
				// the expected clock drift; for more details
				// see http://redis.io/topics/distlock
				//   driftFactor: 0.01, // time in ms

				// the max number of times Redlock will attempt
				// to lock a resource before erroring
				retryCount: 10,

				// the time in ms between attempts
				retryDelay: 2000, // time in ms

				// the max time in ms randomly added to retries
				// to improve performance under high contention
				// see https://www.awsarchitectureblog.com/2015/03/backoff.html
				retryJitter: 2000 // time in ms
			}
		}
	}
});

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721-media',
	version: 1,
	mixins: [callApiMixin, dbCW721MediaLinkMixin, redisMixin],
	// cache: {
	// 	// Cache key:  "media_link_key" from ctx.params
	// 	keys: ["media_link_key"],
	// 	ttl: 5000000,
	// 	lock: true,
	// },
	events: {
		'CW721-media.get-media-link': {
			// cache: {
			// 	// Cache key:  "media_link_key" from ctx.params
			// 	keys: ["media_link_key"],
			// 	ttl: 5000000,
			// 	lock: true,
			// },
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const file_name = ctx.params.file_name;
				const media_link_key = ctx.params.media_link_key;
				// @ts-ignore
				const redisClient: RedisClientType = await this.getRedisClient();

				// @ts-ignore
				this.logger.debug('get-media-link ctx.params', uri, media_link_key, CONTRACT_TYPE.CW721);
				// @ts-ignore
				// const processingFlag = (await broker.cacher?.get(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)) ? true : false;

				await redisClient
					.watch(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`);

				const getRs = redisClient.multi().get(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`);
				let [processingFlag] = await getRs.exec();
				let rs = processingFlag ? true : false;
				// // @ts-ignore
				// this.logger.info('getRs.exec()',media_link_key, getRs.exec());

				// const processingFlag = (await redisClient.get("xxxxxxxxxxxxxxxxxxx")) ? true : false;
				// const [setKeyReply, otherKeyValue] = await redisClient
				// 	.multi()
				// 	// .watch(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)
				// 	.get(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)
				// 	// .set(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`, "true")
				// 	.exec(); // ['OK', 'another-value']
				// @ts-ignore
				this.logger.info('get-media-link ctx.params', media_link_key, rs);
				if (!rs) {
					// @ts-ignore
					this.logger.info('setKeyReply watch');
					// @ts-ignore
					// await broker.cacher?.set(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`, true, CACHER_INDEXER_TTL);
					// const [setKeyReply] = await redisClient
					// .watch(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)
					// .set(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`, "true")
					// .exec(); // ['OK', 'another-value']

					// await redisClient.set(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`, "true", {EX:CACHER_INDEXER_TTL});
					const eventID = Common.makeid();
					const xxx = redisClient.blPop(
						commandOptions({ isolated: true }),
						`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`,
						0
					);
					await xxx;
					
					const [setKeyReply] = await redisClient
						.multi()
						// .watch(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)
						// .get(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`)
						.set(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`, eventID)
						.exec(); // ['OK', 'another-value']

					// @ts-ignore
					this.logger.info('setKeyReply watch', media_link_key, eventID, setKeyReply);
					// @ts-ignore
					await this.getMediaLink(uri, file_name, media_link_key);
					// @ts-ignore
					// await broker.cacher?.del(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`);
					await redisClient.del(`${GET_MEDIA_LINK_PREFIX}_${media_link_key}`);
				}
			}
		},
	},
})
export default class CrawlAssetService extends moleculer.Service {

	async getMediaLink(uri: string, file_name: string, key: string) {
		try {
			this.logger.info("getMediaLink", uri, file_name, key);
			let query: QueryOptions = { key };
			const media: any[] = await this.broker.call(CW721_MEDIA_MANAGER_ACTION.FIND, { query }, OPTs);
			this.logger.info("media", media);
			if (media.length === 0) {
				await this.broker.call(CW721_MEDIA_MANAGER_ACTION.INSERT, {
					_id: new Types.ObjectId(),
					key,
					media_link: "",
					status: MediaStatus.HANDLING
				}, OPTs);
				await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK, { uri, file_name, key }, OPTs);
			} else {
				switch (media[0].status) {
					case MediaStatus.PENDING: {
						await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK, { uri, file_name, key }, OPTs);
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
		} catch (error) {
			this.logger.error(error);
			// broker.cacher.middleware();
			await broker.cacher?.del(`${GET_MEDIA_LINK_PREFIX}_${key}`);
		}
	}
}
export class CW721AssetMedia {
}
