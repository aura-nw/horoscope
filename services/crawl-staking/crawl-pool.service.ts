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
import { IPoolResponseFromLCD } from '../../types';
import { Job, KeepJobsOptions } from 'bull';
import { PoolEntity, ValidatorEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import QueueConfig from '../../config/queue';

export default class CrawlPoolService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbPoolMixin = dbPoolMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlPool',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
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

	async handleJob(path: String) {
		let urlToCall = path;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let resultCallApi: IPoolResponseFromLCD = await this.callApiFromDomain(url, urlToCall);
		const item: PoolEntity = new JsonConvert().deserializeObject(
			resultCallApi.pool,
			PoolEntity,
		);

		try {
			let foundPool = await this.adapter.findOne({ 'custom_info.chain_id': Config.CHAIN_ID });
			try {
				if (foundPool) {
					item._id = foundPool._id;
					// await this.adapter.clearCache();
					// await this.adapter.updateById(foundPool._id, item);
					await this.actions.update(item);
				} else {
					await this.adapter.insert(item);
				}
			} catch (error) {
				this.logger.error(error);
			}
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
				removeOnFail: {
					count: 5,
				},
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
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'crawl.pool' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
