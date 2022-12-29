/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { Types } from 'mongoose';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbSupplyMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { Utils } from '../../utils/utils';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { ISupplyResponseFromLCD } from '../../types';
import { SupplyEntity } from '../../entities';
import { Coin } from '../../entities/coin.entity';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlSupplyService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlSupply',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbSupplyMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.supply': {
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

		let urlToCall = `${path}`;
		let done = false;
		let resultCallApi: ISupplyResponseFromLCD;
		const listSupplies: Coin[] = [];
		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, urlToCall);

			listSupplies.push(...resultCallApi.supply);
			if (resultCallApi.pagination.next_key === null) {
				done = true;
			} else {
				urlToCall = `${path}?pagination.key=${encodeURIComponent(
					resultCallApi.pagination.next_key.toString(),
				)}`;
			}
		}

		const crawlSupply = {} as SupplyEntity;
		crawlSupply.supply = listSupplies;

		const foundSupply: SupplyEntity = await this.adapter.findOne({});
		try {
			if (foundSupply) {
				// eslint-disable-next-line no-underscore-dangle
				crawlSupply._id = foundSupply._id;
				// eslint-disable-next-line no-underscore-dangle
				await this.adapter.updateById(foundSupply._id, crawlSupply);
			} else {
				crawlSupply._id = new Types.ObjectId();
				await this.adapter.insert(crawlSupply);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async _start() {
		this.createJob(
			'crawl.supply',
			{
				url: `${Config.GET_SUPPLY}`,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_SUPPLY, 10),
				},
			},
		);

		this.getQueue('crawl.supply').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.supply').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.supply').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
