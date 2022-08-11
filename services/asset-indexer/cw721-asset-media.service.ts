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
// const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };
import { CONTRACT_TYPE, CW721_MEDIA_MANAGER_ACTION } from '../../common/constant';
import { Common } from './common.service';
import { QueryOptions } from 'moleculer-db';

const callApiMixin = new CallApiMixin().start();
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

const broker = new ServiceBroker({
	cacher: {
		type: "Redis",
		options: {
			// Prefix for keys
			prefix: "get-media-link",
			// set Time-to-live to 120sec.
			ttl: 120,
		}
	}
});

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'CW721-media',
	version: 1,
	mixins: [callApiMixin, dbCW721MediaLinkMixin],
	events: {
		'CW721-media.get-media-link': {
			async handler(ctx: Context<any>) {
				const uri = ctx.params.uri;
				const file_name = ctx.params.file_name;
				const media_link_key = ctx.params.media_link_key;
				// @ts-ignore
				this.logger.info('get-media-link ctx.params', uri, media_link_key, CONTRACT_TYPE.CW721);
				// @ts-ignore
				const processingFlag = await broker.cacher?.get(`${media_link_key}`);
				if (!processingFlag) {
					// @ts-ignore
					await broker.cacher?.set(`${media_link_key}`, true);
					// @ts-ignore
					await this.getMediaLink(uri, file_name, media_link_key);
					// @ts-ignore
					await broker.cacher?.del(`${media_link_key}`);
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
			const media: any[] = await this.broker.call(CW721_MEDIA_MANAGER_ACTION.FIND, { query });
			this.logger.info("media", media);
			if (media.length === 0) {
				await this.broker.call(CW721_MEDIA_MANAGER_ACTION.INSERT, {
					_id: new Types.ObjectId(),
					key,
					media_link: "",
					status: MediaStatus.HANDLING
				});
				await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK, { uri, file_name, key },OPTs);
			} else {
				switch (media[0].status) {
					case MediaStatus.PENDING: {
						await this.broker.call(CW721_MEDIA_MANAGER_ACTION.UPDATE_MEDIA_LINK, { uri, file_name, key },OPTs);
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
			await broker.cacher?.del(`${key}`);
		}
	}
}
export class CW721AssetMedia {
}
