/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { Config } from '../../common';
import { dbDailyCw20HolderMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlDailyCw20HolderService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlDailyCw20Holder',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbDailyCw20HolderMixin],
			queues: {
				'crawl.daily-cw20-holder': {
					concurrency: parseInt(Config.CONCURRENCY_DAILY_CW20_HOLDER, 10),
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
		const listQueries: any[] = [];
		let resultAsset: any;
		let resultHolder: any;
		try {
			[resultAsset, resultHolder] = await Promise.all([
				this.broker.call('v1.cw20-holder.act-group-count'),
				this.adapter.find(),
			]);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
		this.logger.info('resultAsset', JSON.stringify(resultAsset));
		this.logger.info('resultHolder', JSON.stringify(resultHolder));

		resultAsset.map((asset: any) => {
			let holder = resultHolder.find(
				/* eslint-disable no-underscore-dangle, camelcase */
				(item: any) => item.contract_address === asset._id.contract_address,
			);
			if (holder) {
				listQueries.push(
					this.adapter.updateById(holder._id, {
						$set: {
							old_holders: holder.new_holders,
							new_holders: asset.total_holders,
							change_percent:
								((asset.total_holders - holder.new_holders) / holder.new_holders) *
								100,
						},
					}),
				);
			} else {
				holder = {
					_id: new Types.ObjectId(),
					code_id: asset._id.code_id,
					contract_address: asset._id.contract_address,
					old_holders: 0,
					new_holders: asset.total_holders,
					change_percent: 0,
				};
				listQueries.push(this.adapter.insert(holder));
			}
			/* eslint-enable no-underscore-dangle, camelcase */
		});

		try {
			await Promise.all(listQueries);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public async _start() {
		await this.broker.waitForServices(['v1.cw20-holder']);

		this.createJob(
			'crawl.daily-cw20-holder',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					cron: '0 0 0 * * ?',
				},
			},
		);

		this.getQueue('crawl.daily-cw20-holder').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed! result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.daily-cw20-holder').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed! error: ${job.failedReason}`);
		});
		this.getQueue('crawl.daily-cw20-holder').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
