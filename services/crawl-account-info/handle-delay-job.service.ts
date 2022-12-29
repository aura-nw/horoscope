/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { DELAY_JOB_TYPE } from '../../common/constant';
import { queueConfig } from '../../config/queue';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleDelayJobService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleDelayJob',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbAccountInfoMixin],
			queues: {
				'handle.delay-job': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_DELAY_JOB, 10),
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
		const listUpdateQueries: any[] = [];

		let currentJobs: any[];
		try {
			currentJobs = await this.broker.call('v1.delay-job.findPendingJobs', { chainId: Config.CHAIN_ID });
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
		for (const job of currentJobs) {
			try {
				if (new Date(job.expire_time).getTime() <= new Date().getTime()) {
					switch (job.type) {
						case DELAY_JOB_TYPE.REDELEGATE:
							this.createJob(
								'crawl.account-redelegates',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);

							listUpdateQueries.push(
								this.broker.call('v1.delay-job.deleteFinishedJob', {
									_id: job._id,
									chainId: Config.CHAIN_ID,
								}),
							);
							break;
						case DELAY_JOB_TYPE.UNBOND:
							this.createJob(
								'crawl.account-balances',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);
							this.createJob(
								'crawl.account-spendable-balances',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);
							this.createJob(
								'crawl.account-unbonds',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);

							listUpdateQueries.push(
								this.broker.call('v1.delay-job.deleteFinishedJob', {
									_id: job._id,
									chainId: Config.CHAIN_ID,
								}),
							);
							break;
						case DELAY_JOB_TYPE.DELAYED_VESTING:
							this.createJob(
								'crawl.account-spendable-balances',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);

							listUpdateQueries.push(
								this.broker.call('v1.delay-job.deleteFinishedJob', {
									_id: job._id,
									chainId: Config.CHAIN_ID,
								}),
							);
							break;
						case DELAY_JOB_TYPE.PERIODIC_VESTING:
							this.createJob(
								'crawl.account-spendable-balances',
								{
									listAddresses: [job.content.address],
									chainId: Config.CHAIN_ID,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);

							const updateInfo = await this.adapter.findOne({
								address: job.content.address,
							});
							const newJobExpireTime = new Date(
								// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
								(new Date(job.expire_time).getTime() +
									parseInt(
										updateInfo.account_auth.account.vesting_periods[0].length,
										10,
									)) *
								1000,
							);
							if (
								newJobExpireTime.getTime() >=
								new Date(
									parseInt(
										updateInfo.account_auth.account.base_vesting_account.end_time,
										10,
									) * 1000,
								).getTime()
							) {
								listUpdateQueries.push(
									this.broker.call('v1.delay-job.deleteFinishedJob', {
										_id: job._id,
										chainId: Config.CHAIN_ID,
									}),
								);
							} else {
								listUpdateQueries.push(
									this.broker.call('v1.delay-job.updateJob', {
										_id: job._id,
										update: {
											$set: {
												expire_time: newJobExpireTime,
											},
										},
										chainId: Config.CHAIN_ID,
									}),
								);
							}
							break;
					}
				}
			} catch (error) {
				this.logger.error(`Error handling job ${JSON.stringify(job)}`);
				this.logger.error(error);
			}
		}
		const result = await Promise.all(listUpdateQueries);
		this.logger.info(result);
	}

	public async _start() {
		await this.broker.waitForServices(['v1.delay-job']);

		this.createJob(
			'handle.delay-job',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_DELAY_JOB, 10),
				},
			},
		);

		this.getQueue('handle.delay-job').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.delay-job').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('handle.delay-job').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
