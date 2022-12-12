/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { dbCommunityPoolMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { ICommunityPoolResponseFromLCD } from '../../types';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { CommunityPoolEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlCommunityPoolService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlCommunityPool',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbCommunityPoolMixin,
				new CallApiMixin().start(),
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

	async handleJob(path: string) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		const resultCallApi: ICommunityPoolResponseFromLCD = await this.callApiFromDomain(
			url,
			path,
		);
		const jsonConvert = new JsonConvert();
		// JsonConvert.operationMode = OperationMode.LOGGING;
		const item: CommunityPoolEntity = jsonConvert.deserializeObject(
			resultCallApi,
			CommunityPoolEntity,
		);
		const foundPool: CommunityPoolEntity = await this.adapter.findOne({});
		try {
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
			'crawl.community-pool',
			{
				url: `${Config.GET_COMMUNITY_POOL}`,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_COMMUNITY_POOL, 10),
				},
			},
		);

		this.getQueue('crawl.community-pool').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.community-pool').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.community-pool').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
