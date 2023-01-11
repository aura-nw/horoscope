/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { Types } from 'mongoose';
import { Config } from '../../common';
import { dbDailyCw20HolderMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
import { UpdateContractHolderRequest } from '../../types';
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
						await this.handleJob(job.data.offset);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				'update-contract-holders': {
					async handler(ctx: Context<UpdateContractHolderRequest>): Promise<any> {
						await this.updateContractHolders(ctx.params.address, ctx.params.codeId);
					},
				},
			},
		});
	}

	async handleJob(offset: number) {
		const result = await this.adapter.find({
			limit: 100,
			offset,
		});

		if (result.length > 0) {
			result.map(async (res: any) => {
				try {
					await this.adapter.updateById(res._id, {
						$set: {
							old_holders: res.new_holders,
							change_percent:
								res.old_holders !== 0
									? ((res.new_holders - res.old_holders) / res.old_holders) * 100
									: 0,
						},
					});
				} catch (error) {
					this.logger.error(error);
					throw error;
				}
			});

			this.createJob(
				'crawl.daily-cw20-holder',
				{ offset: ++offset },
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 3,
					},
				},
			);
		}
	}

	async updateContractHolders(contractAddress: string, codeId: number) {
		const [holders, record] = await Promise.all([
			this.broker.call('v1.cw20-holder.act-count-by-address', {
				address: contractAddress,
			}),
			this.adapter.findOne({ contract_address: contractAddress }),
		]);

		try {
			if (record) {
				await this.adapter.updateById(record._id, {
					$set: {
						new_holders: holders,
					},
				});
			} else {
				const holder = {
					_id: new Types.ObjectId(),
					code_id: codeId,
					contract_address: contractAddress,
					old_holders: 0,
					new_holders: holders,
					change_percent: 0,
				};
				await this.adapter.insert(holder);
			}
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async _start() {
		await this.broker.waitForServices(['v1.cw20-holder']);

		this.createJob(
			'crawl.daily-cw20-holder',
			{ offset: 0 },
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
		return super._start();
	}
}
