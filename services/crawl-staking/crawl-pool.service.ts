/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { dbPoolMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { IPoolResponseFromLCD } from '../../types';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { PoolEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlPoolService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlPool',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbPoolMixin,
			],
			queues: {
				'crawl.pool': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob() {
		const urlToCall = Config.GET_POOL;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		const resultCallApi: IPoolResponseFromLCD = await this.callApiFromDomain(url, urlToCall);
		const item: PoolEntity = new JsonConvert().deserializeObject(
			resultCallApi.pool,
			PoolEntity,
		);

		try {
			const foundPool = await this.adapter.findOne({});
			if (foundPool) {
				// eslint-disable-next-line no-underscore-dangle
				item._id = foundPool._id;
				// eslint-disable-next-line no-underscore-dangle
				await this.adapter.updateById(foundPool._id, item);
			} else {
				await this.adapter.insert(item);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}
	public async _start() {
		this.createJob(
			'crawl.pool',
			{},
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
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.pool').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
