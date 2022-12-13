/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { QueryEpochsInfoResponseSDKType } from 'osmojs/types/codegen/osmosis/epochs/query';
import { EpochInfoSDKType } from 'osmojs/types/codegen/osmosis/epochs/genesis';
import { Types } from 'mongoose';
import { dbEpochMixin } from '../../../mixins/dbMixinMongoose';
import { Config } from '../../../common';
import { URL_TYPE_CONSTANTS } from '../../../common/constant';
import { Utils } from '../../../utils/utils';
import { queueConfig } from '../../../config/queue';
import CallApiMixin from '../../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlEpochService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlEpoch',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbEpochMixin,
			],
			queues: {
				'crawl.epoch': {
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
		const listEpoch: EpochInfoSDKType[] = [];

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

		const listEpochInDB: any[] = await this.adapter.lean({
			query: {},
		});
		const listPromise: Promise<any>[] = [];
		const listIndexDelete: number[] = [];
		await Promise.all(
			listEpoch.map(async (epoch) => {
				const foundEpoch = listEpochInDB.find(
					(item) => item.identifier === epoch.identifier,
				);
				const foundEpochIndex = listEpochInDB.findIndex(
					(item) => item.identifier === epoch.identifier,
				);

				try {
					if (foundEpoch) {
						// eslint-disable-next-line no-underscore-dangle
						listPromise.push(this.adapter.updateById(foundEpoch._id, epoch));
					} else {
						const item = { _id: Types.ObjectId(), ...epoch };
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
				// eslint-disable-next-line no-underscore-dangle
				listPromise.push(this.adapter.removeById(epoch._id));
			}),
		);

		await Promise.all(listPromise);
	}

	public async _start() {
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
