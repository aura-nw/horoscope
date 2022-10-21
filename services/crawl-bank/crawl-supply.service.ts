/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
import { dbSupplyMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { ISupplyResponseFromLCD } from '../../types';
import { JsonConvert } from 'json2typescript';
import { SupplyEntity } from '../../entities';
import { Coin } from '../../entities/coin.entity';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class CrawlSupplyService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbSupplyMixin = dbSupplyMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlSupply',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbSupplyMixin,
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

	async handleJob(path: String) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let urlToCall = `${path}`;
		let done = false;
		let resultCallApi: ISupplyResponseFromLCD;
		let listSupplies: Coin[] = [];
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

		let crawlSupply = {} as SupplyEntity;
		crawlSupply.supply = listSupplies;

		let foundSupply: SupplyEntity = await this.adapter.findOne({
			'custom_info.chain_id': Config.CHAIN_ID,
		});
		try {
			if (foundSupply) {
				crawlSupply._id = foundSupply._id;
				await this.adapter.updateById(foundSupply._id, crawlSupply);
			} else {
				let jsonConvert = new JsonConvert();
				const item: SupplyEntity = jsonConvert.deserializeObject(crawlSupply, SupplyEntity);
				await this.adapter.insert(item);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
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
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.supply').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
