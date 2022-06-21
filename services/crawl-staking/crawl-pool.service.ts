/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbPoolMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { PoolResponseFromApi, ValidatorResponseFromApi } from '../../types';
import { Job } from 'bull';
import { PoolEntity, ValidatorEntity } from '../../entities';

export default class CrawlPoolService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbPoolMixin = dbPoolMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlPool',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.pool',
					},
				),
				this.callApiMixin,
				this.dbPoolMixin,
			],
			queues: {
				'crawl.pool': {
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
		let resultCallApi: PoolResponseFromApi = await this.callApi(
			URL_TYPE_CONSTANTS.LCD,
			urlToCall,
		);
		const item: any = new JsonConvert().deserializeObject(resultCallApi.pool, PoolEntity);
		try {
			await this.adapter.insert(item);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.createJob(
			'crawl.pool',
			{
				url: `${Config.GET_POOL}`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_POOL, 10),
				},
			},
		);

		this.getQueue('crawl.pool').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.pool').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.pool').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		return super._start();
	}
}
