/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { QueryPoolsResponseSDKType } from 'osmojs/types/codegen/osmosis/gamm/v1beta1/query';
import { Types } from 'mongoose';
import { dbGammPoolMixin } from '../../../mixins/dbMixinMongoose';
import { Config } from '../../../common';
import { URL_TYPE_CONSTANTS } from '../../../common/constant';
import { Utils } from '../../../utils/utils';
import { queueConfig } from '../../../config/queue';
import CallApiMixin from '../../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlGammPoolService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlGammPool',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbGammPoolMixin,
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
		const listPool: any[] = [];

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

		const listPoolInDB: any[] = await this.adapter.lean({
			query: {},
		});
		const listBulk: any[] = [];
		const listIndexDelete: number[] = [];
		await Promise.all(
			listPool.map(async (pool) => {
				const foundPool = listPoolInDB.find((item) => item.id === pool.id);
				const foundPoolIndex = listPoolInDB.findIndex((item) => item.id === pool.id);

				try {
					if (foundPool) {
						listBulk.push({
							// eslint-disable-next-line no-underscore-dangle
							updateOne: { filter: { _id: foundPool._id }, update: pool },
						});
					} else {
						const item = { _id: Types.ObjectId(), ...pool };
						listBulk.push({ insertOne: { document: item } });
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
				// eslint-disable-next-line no-underscore-dangle
				listBulk.push({ deleteOne: { _id: pool._id } });
			}),
		);

		// Await Promise.all(listPromise);
		const result = await this.adapter.bulkWrite(listBulk);
		this.logger.info(result);
	}

	public async _start() {
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
