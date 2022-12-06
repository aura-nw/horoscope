/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbGammPoolMixin } from '../../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { Config } from '../../../common';
import { URL_TYPE_CONSTANTS } from '../../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../../utils/utils';
import { QueueConfig } from '../../../config/queue';
import { QueryPoolsResponseSDKType } from 'osmojs/types/codegen/osmosis/gamm/v1beta1/query';
import { Pool } from 'osmojs/types/codegen/osmosis/gamm/pool-models/balancer/balancerPool';
import { Types } from 'mongoose';

export default class CrawlGammPoolService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbGammPoolMixin = dbGammPoolMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlGammPool',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbGammPoolMixin,
			],
			queues: {
				'crawl.gamm.pool': {
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
		let listPool: any[] = [];

		let resultCallApi: QueryPoolsResponseSDKType;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		const originPath = 'osmosis/gamm/v1beta1/pools?pagination.limit=100';
		let path = originPath;
		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, path);
			listPool.push(...resultCallApi.pools);
			const nextKey = resultCallApi.pagination?.next_key;
			if (nextKey) {
				path = `${originPath}&pagination.key=${nextKey}`;
			} else {
				done = true;
			}
		}

		this.logger.debug(`result: ${JSON.stringify(listPool)}`);

		let listPoolInDB: any[] = await this.adapter.lean({
			query: {},
		});
		let listBulk: any[] = [];
		let listIndexDelete: number[] = [];
		await Promise.all(
			listPool.map(async (pool) => {
				let foundPool = listPoolInDB.find((item) => item.id == pool.id);
				let foundPoolIndex = listPoolInDB.findIndex((item) => item.id == pool.id);

				try {
					if (foundPool) {
						listBulk.push({
							updateOne: { filter: { _id: foundPool._id }, update: pool },
						});
					} else {
						let item = { _id: Types.ObjectId(), ...pool };
						listBulk.push({ insertOne: { document: item } });
						// listPromise.push(this.adapter.insert(item));
					}
					if (foundPoolIndex > -1 && foundPool) {
						listIndexDelete.push(foundPoolIndex);
					}
				} catch (error) {
					this.logger.error(error);
				}
			}),
		);
		await Promise.all(
			listIndexDelete.map((index) => {
				delete listPoolInDB[index];
			}),
		);

		await Promise.all(
			listPoolInDB.map(async (pool) => {
				listBulk.push({ deleteOne: { _id: pool._id } });
			}),
		);

		// await Promise.all(listPromise);
		let result = await this.adapter.bulkWrite(listBulk);
		this.logger.info(result);
	}

	async _start() {
		this.createJob(
			'crawl.gamm.pool',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt('1000', 10),
				},
			},
		);

		this.getQueue('crawl.epoch').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.epoch').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.epoch').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
