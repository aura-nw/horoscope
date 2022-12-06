/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbEpochMixin } from '../../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { Config } from '../../../common';
import { URL_TYPE_CONSTANTS } from '../../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../../utils/utils';
import { QueueConfig } from '../../../config/queue';
import { QueryEpochsInfoResponseSDKType } from 'osmojs/types/codegen/osmosis/epochs/query';
import { EpochInfoSDKType } from 'osmojs/types/codegen/osmosis/epochs/genesis';
import { Types } from 'mongoose';

export default class CrawlEpochService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbEpochMixin = dbEpochMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlEpoch',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbEpochMixin,
			],
			queues: {
				'crawl.epoch': {
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

	async handleJob() {
		let listEpoch: EpochInfoSDKType[] = [];

		let resultCallApi: QueryEpochsInfoResponseSDKType;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		const path = '/osmosis/epochs/v1beta1/epochs';

		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, path);
			listEpoch.push(...resultCallApi.epochs);
			done = true;
		}

		this.logger.debug(`result: ${JSON.stringify(listEpoch)}`);

		let listEpochInDB: any[] = await this.adapter.lean({
			query: {},
		});
		let listPromise: Promise<any>[] = [];
		let listIndexDelete: number[] = [];
		await Promise.all(
			listEpoch.map(async (epoch) => {
				let foundEpoch = listEpochInDB.find((item) => item.identifier == epoch.identifier);
				let foundEpochIndex = listEpochInDB.findIndex(
					(item) => item.identifier == epoch.identifier,
				);

				try {
					if (foundEpoch) {
						listPromise.push(this.adapter.updateById(foundEpoch._id, epoch));
					} else {
						let item = { _id: Types.ObjectId(), ...epoch };
						listPromise.push(this.adapter.insert(item));
					}
					if (foundEpochIndex > -1 && foundEpoch) {
						listIndexDelete.push(foundEpochIndex);
					}
				} catch (error) {
					this.logger.error(error);
				}
			}),
		);
		await Promise.all(
			listIndexDelete.map((index) => {
				delete listEpochInDB[index];
			}),
		);

		await Promise.all(
			listEpochInDB.map(async (epoch) => {
				listPromise.push(this.adapter.removeById(epoch._id));
			}),
		);

		await Promise.all(listPromise);
	}

	async _start() {
		this.createJob(
			'crawl.epoch',
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
