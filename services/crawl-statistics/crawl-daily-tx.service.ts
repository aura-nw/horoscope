/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { ObjectId } from 'mongodb';
import { fromBech32 } from '@cosmjs/encoding';
import { DailyTxStatistics } from '../../entities';
import { CONST_CHAR } from '../../common/constant';
import { dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlDailyTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlDailyTx',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbDailyTxStatisticsMixin],
			queues: {
				'crawl.daily-tx': {
					concurrency: parseInt(Config.CONCURRENCY_DAILY_ACCOUNT_STATISTICS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.id, job.data.txCount, job.data.activeAddrs);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(id: any, txCount: number, activeAddrs: string[]) {
		const listAddresses: string[] = [];

		const syncDate = new Date();
		const endTime = syncDate.setUTCHours(0, 0, 0, 0);
		syncDate.setDate(syncDate.getDate() - 1);
		const startTime = syncDate.setUTCHours(0, 0, 0, 0);
		this.logger.info(`Get txs from _id ${id} for day ${new Date(startTime)}`);

		const query: any = {
			'indexes.timestamp': {
				$gte: new Date(startTime),
				$lt: new Date(endTime),
			},
		};
		if (id) {
			// eslint-disable-next-line no-underscore-dangle
			query._id = { $gt: new ObjectId(id) };
		}
		this.logger.info(`Query ${JSON.stringify(query)}`);

		const dailyTxs: any = await this.broker.call(
			'v1.transaction-stats.act-find',
			{
				query,
				sort: '_id',
				limit: 100,
			},
			{ meta: { $cache: false }, timeout: 0 },
		);
		this.logger.info(`Number of Txs retrieved from _id ${id}: ${dailyTxs.length}`);

		if (dailyTxs.length > 0) {
			try {
				dailyTxs.map((txs: any) => {
					txs.tx_response.logs.map((log: any) => {
						try {
							let event = log.events
								.filter(
									(e: any) =>
										e.type === CONST_CHAR.COIN_RECEIVED ||
										e.type === CONST_CHAR.COIN_SPENT,
								)
								.map((e: any) => e.attributes)
								.map((e: any) =>
									e
										.filter(
											(x: any) =>
												x.key === CONST_CHAR.RECEIVER ||
												x.key === CONST_CHAR.SPENDER,
										)
										.map((x: any) => x.value),
								)
								.flat();
							event = event.filter((e: string) => fromBech32(e).data.length === 20);
							if (event) {
								listAddresses.push(...event);
							}
						} catch (error) {
							this.logger.error(error);
							throw error;
						}
					});
				});
			} catch (error) {
				this.logger.error(error);
			}

			activeAddrs = activeAddrs.concat(listAddresses).filter(this.onlyUnique);

			// eslint-disable-next-line no-underscore-dangle
			const newId = dailyTxs[dailyTxs.length - 1]._id;
			txCount += dailyTxs.length;
			this.createJob(
				'crawl.daily-tx',
				{
					id: newId,
					txCount,
					activeAddrs,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 3,
					},
				},
			);
		} else {
			try {
				syncDate.setDate(syncDate.getDate() - 1);
				const previousDay = syncDate.setUTCHours(0, 0, 0, 0);
				const [resultTotalAccs, previousDailyTx]: [any, DailyTxStatistics] =
					await Promise.all([
						this.broker.call(
							'v1.account-stats.countTotal',
							{},
							{ meta: { $cache: false }, timeout: 0 },
						),
						this.adapter.findOne({
							date: new Date(previousDay),
						}),
					]);

				const dailyTxStatistics: DailyTxStatistics = {} as DailyTxStatistics;
				/* eslint-disable camelcase */
				dailyTxStatistics.daily_txs = txCount;
				dailyTxStatistics.daily_active_addresses = activeAddrs.filter(
					this.onlyUnique,
				).length;
				dailyTxStatistics.unique_addresses = resultTotalAccs;
				dailyTxStatistics.unique_addresses_increase = previousDailyTx
					? resultTotalAccs - Number(previousDailyTx.unique_addresses)
					: 0;
				dailyTxStatistics.date = new Date(startTime);
				const item: DailyTxStatistics = new JsonConvert().deserializeObject(
					dailyTxStatistics,
					DailyTxStatistics,
				);
				await this.adapter.insert(item);
				this.logger.info(`Daily Blockchain Statistics for day ${new Date(startTime)}`);
				this.logger.info(JSON.stringify(item));
				/* eslint-enable camelcase */
			} catch (error) {
				this.logger.error(
					`Error insert duplicate record of daily txs for day ${new Date(startTime)}`,
				);
			}
		}
	}

	onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
	}

	public async _start() {
		this.createJob(
			'crawl.daily-tx',
			{
				id: null,
				txCount: 0,
				activeAddrs: [],
			},
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

		this.getQueue('crawl.daily-tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed! result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.daily-tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed! error: ${job.failedReason}`);
		});
		this.getQueue('crawl.daily-tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
