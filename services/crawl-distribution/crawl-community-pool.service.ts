/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbCommunityPoolMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import {
	CommunityPoolResponseFromApi,
	PoolResponseFromApi,
	ValidatorResponseFromApi,
} from '../../types';
import { Job } from 'bull';
import { CommunityPoolEntity, PoolEntity, ValidatorEntity } from '../../entities';

export default class CrawlCommunityPoolService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbCommunityPoolMixin = dbCommunityPoolMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlCommunityPool',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.pool',
					},
				),
				this.callApiMixin,
				this.dbCommunityPoolMixin,
			],
			queues: {
				'crawl.community-pool': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.url);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(url: String) {
		let urlToCall = url;
		let resultCallApi: CommunityPoolResponseFromApi = await this.callApi(
			URL_TYPE_CONSTANTS.LCD,
			urlToCall,
		);
		let jsonConvert = new JsonConvert();
		jsonConvert.operationMode = OperationMode.LOGGING;
		const item: any = jsonConvert.deserializeObject(resultCallApi, CommunityPoolEntity);
		let foundPool = await this.adapter.findOne({ 'custom_info.chain_id': Config.CHAIN_ID });
		try {
			if (foundPool) {
				this.adapter.updateById(foundPool._id, item);
			} else {
				this.adapter.insert(item);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.createJob(
			'crawl.community-pool',
			{
				url: `${Config.GET_COMMUNITY_POOL}`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_COMMUNITY_POOL, 10),
				},
			},
		);

		this.getQueue('crawl.community-pool').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.community-pool').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.community-pool').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		return super._start();
	}
}
