/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { JsonConvert, OperationMode } from 'json2typescript';
import { IMintInflationResponseFromLCD } from 'types';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { dbInflationMixin } from '../../mixins/dbMixinMongoose';
import { InflationEntity } from '../../entities';
import { Config } from '../../common';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlInflationService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlinflation',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbInflationMixin,
			],
			queues: {
				'crawl.inflation': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}
	async handleJob(param: any) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		const resultCallApi: IMintInflationResponseFromLCD = await this.callApiFromDomain(
			url,
			param.url,
		);

		this.logger.debug(`result: ${JSON.stringify(resultCallApi)}`);
		const foundInflation: InflationEntity = await this.adapter.findOne({});
		if (foundInflation) {
			foundInflation.inflation = resultCallApi.inflation;
			// eslint-disable-next-line no-underscore-dangle
			await this.adapter.updateById(foundInflation._id, foundInflation);
		} else {
			const jsonConvert = new JsonConvert();
			jsonConvert.operationMode = OperationMode.LOGGING;

			const item: InflationEntity = jsonConvert.deserializeObject(
				resultCallApi,
				InflationEntity,
			);
			await this.adapter.insert(item);
		}
	}

	public async _start() {
		this.createJob(
			'crawl.inflation',
			{
				url: `${Config.GET_INFLATION}`,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_INFLATION, 10),
				},
			},
		);

		this.getQueue('crawl.inflation').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.inflation').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.inflation').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
