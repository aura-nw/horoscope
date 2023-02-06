/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { ObjectId } from 'mongodb';
import { dbAccountStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { MSG_TYPE } from '../../common/constant';
import { AccountStatistics, DailyStats } from '../../entities';

import { queueConfig } from '../../config/queue';
import { Config } from '../../common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountStatsService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountStats',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbAccountStatisticsMixin],
			queues: {
				'crawl.account-stats': {
					concurrency: parseInt(Config.CONCURRENCY_DAILY_TX_STATISTICS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.id, job.data.listData);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(id: any, listData: any[]) {
		const listUpdateQueries: any[] = [];

		const syncDate = new Date();
		const endTime = syncDate.setUTCHours(0, 0, 0, 0);
		syncDate.setDate(syncDate.getDate() - 1);
		const startTime = syncDate.setUTCHours(0, 0, 0, 0);
		this.logger.info(`Get txs from _id ${id} for day ${new Date(startTime)}`);

		const query: any = {
			'indexes.message_action': {
				$in: [MSG_TYPE.MSG_SEND, MSG_TYPE.MSG_MULTI_SEND],
			},
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
				for (const txs of dailyTxs) {
					for (const message of txs.tx.body.messages) {
						switch (message['@type']) {
							case MSG_TYPE.MSG_SEND:
								if (
									listData.find(
										(item: any) => item.address === message.from_address,
									)
								) {
									listData.find(
										(item: any) => item.address === message.from_address,
									).sent_txs += 1;
									listData.find(
										(item: any) => item.address === message.from_address,
									).sent_amount += parseInt(message.amount[0].amount, 10);
								} else {
									listData.push({
										address: message.from_address,
										sent_txs: 1,
										received_txs: 0,
										sent_amount: parseInt(message.amount[0].amount, 10),
										received_amount: 0,
									});
								}
								if (
									listData.find(
										(item: any) => item.address === message.to_address,
									)
								) {
									listData.find(
										(item: any) => item.address === message.to_address,
									).received_txs += 1;
									listData.find(
										(item: any) => item.address === message.to_address,
									).received_amount += parseInt(message.amount[0].amount, 10);
								} else {
									listData.push({
										address: message.to_address,
										sent_txs: 0,
										received_txs: 1,
										sent_amount: 0,
										received_amount: parseInt(message.amount[0].amount, 10),
									});
								}
								break;
							case MSG_TYPE.MSG_MULTI_SEND:
								if (
									listData.find(
										(item: any) => item.address === message.inputs[0].address,
									)
								) {
									listData.find(
										(item: any) => item.address === message.inputs[0].address,
									).sent_txs += 1;
									listData.find(
										(item: any) => item.address === message.inputs[0].address,
									).sent_amount += parseInt(
										message.inputs[0].coins[0].amount,
										10,
									);
								} else {
									listData.push({
										address: message.inputs[0].address,
										sent_txs: 1,
										received_txs: 0,
										sent_amount: parseInt(
											message.inputs[0].coins[0].amount,
											10,
										),
										received_amount: 0,
									});
								}
								const addrs: any[] = [];
								message.outputs.map((output: any) => {
									if (
										listData.find(
											(item: any) => item.address === output.address,
										)
									) {
										if (!addrs.includes(output.address)) {
											listData.find(
												(item: any) => item.address === output.address,
											).received_txs += 1;
										}
										listData.find(
											(item: any) => item.address === output.address,
										).received_amount += parseInt(output.coins[0].amount, 10);
									} else {
										listData.push({
											address: output.address,
											sent_txs: 0,
											received_txs: 1,
											sent_amount: 0,
											received_amount: parseInt(output.coins[0].amount, 10),
										});
									}
									addrs.push(output.address); // Add address to list to check if duplicate in message.outputs
								});
								break;
						}
					}
				}
			} catch (error) {
				this.logger.error(error);
			}

			// eslint-disable-next-line no-underscore-dangle
			const newId = dailyTxs[dailyTxs.length - 1]._id;
			this.createJob(
				'crawl.account-stats',
				{
					id: newId,
					listData,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 3,
					},
				},
			);
		} else {
			// ERROR: Fix if there are too many accounts
			const listAccountStats: AccountStatistics[] = await this.adapter.find({
				query: {
					'custom_info.chain_id': Config.CHAIN_ID,
				},
			});
			listData.map((item: any) => {
				const account = listAccountStats.find(
					(accountInList: AccountStatistics) => item.address === accountInList.address,
				);
				if (account) {
					if (account.per_day.length === 7) {
						account.per_day.shift();
					}
					account.per_day.push({
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					});
					account.one_day = {
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					};
					const lastThreeDays =
						account.per_day.length > 3 ? account.per_day.slice(-3) : account.per_day;
					account.three_days = {
						total_sent_tx: {
							amount: lastThreeDays.reduce(
								/* eslint-disable @typescript-eslint/restrict-plus-operands */
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
					};
					account.seven_days = {
						total_sent_tx: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						/* eslint-enable @typescript-eslint/restrict-plus-operands */
					};
				} else {
					const accountStatistics: AccountStatistics = {} as AccountStatistics;
					accountStatistics.address = item.address;
					accountStatistics.per_day = [] as DailyStats[];
					accountStatistics.per_day.push({
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					} as DailyStats);
					accountStatistics.one_day = {
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					};
					accountStatistics.three_days = {
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					};
					accountStatistics.seven_days = {
						total_sent_tx: {
							amount: item.sent_txs,
							percentage: 0,
						},
						total_received_tx: {
							amount: item.received_txs,
							percentage: 0,
						},
						total_sent_amount: {
							amount: item.sent_amount,
							percentage: 0,
						},
						total_received_amount: {
							amount: item.received_amount,
							percentage: 0,
						},
					};
					listAccountStats.push(accountStatistics);
				}
			});
			listAccountStats.map((account: any) => {
				if (!listData.find((item) => item.address === account.address)) {
					if (account.per_day.length === 7) {
						account.per_day.shift();
					}
					account.per_day.push({
						total_sent_tx: {
							amount: 0,
							percentage: 0,
						},
						total_received_tx: {
							amount: 0,
							percentage: 0,
						},
						total_sent_amount: {
							amount: 0,
							percentage: 0,
						},
						total_received_amount: {
							amount: 0,
							percentage: 0,
						},
					});
					account.one_day = {
						total_sent_tx: {
							amount: 0,
							percentage: 0,
						},
						total_received_tx: {
							amount: 0,
							percentage: 0,
						},
						total_sent_amount: {
							amount: 0,
							percentage: 0,
						},
						total_received_amount: {
							amount: 0,
							percentage: 0,
						},
					};
					const lastThreeDays =
						account.per_day.length > 3 ? account.per_day.slice(-3) : account.per_day;
					account.three_days = {
						total_sent_tx: {
							amount: lastThreeDays.reduce(
								/* eslint-disable @typescript-eslint/restrict-plus-operands */
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: lastThreeDays.reduce(
								(a: any, b: any) => a + b.total_received_amount.amount,
								0,
							),
							percentage: 0,
						},
					};
					account.seven_days = {
						total_sent_tx: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: account.per_day.reduce(
								(a: any, b: any) => a + b.total_received_amount.amount,
								0,
							),
							percentage: 0,
						},
					};
				}
			});

			try {
				listAccountStats.map((element) => {
					// Total sent tx percentage
					element.one_day.total_sent_tx.percentage =
						(Number(element.one_day.total_sent_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.one_day.total_sent_tx.amount,
							0,
						);
					element.three_days.total_sent_tx.percentage =
						(Number(element.three_days.total_sent_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.three_days.total_sent_tx.amount,
							0,
						);
					element.seven_days.total_sent_tx.percentage =
						(Number(element.seven_days.total_sent_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.seven_days.total_sent_tx.amount,
							0,
						);

					// Total received tx percentage
					element.one_day.total_received_tx.percentage =
						(Number(element.one_day.total_received_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.one_day.total_received_tx.amount,
							0,
						);
					element.three_days.total_received_tx.percentage =
						(Number(element.three_days.total_received_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.three_days.total_received_tx.amount,
							0,
						);
					element.seven_days.total_received_tx.percentage =
						(Number(element.seven_days.total_received_tx.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.seven_days.total_received_tx.amount,
							0,
						);

					// Total sent amount percentage
					element.one_day.total_sent_amount.percentage =
						(Number(element.one_day.total_sent_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.one_day.total_sent_amount.amount,
							0,
						);
					element.three_days.total_sent_amount.percentage =
						(Number(element.three_days.total_sent_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.three_days.total_sent_amount.amount,
							0,
						);
					element.seven_days.total_sent_amount.percentage =
						(Number(element.seven_days.total_sent_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.seven_days.total_sent_amount.amount,
							0,
						);

					// Total received amount percentage
					element.one_day.total_received_amount.percentage =
						(Number(element.one_day.total_received_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.one_day.total_received_amount.amount,
							0,
						);
					element.three_days.total_received_amount.percentage =
						(Number(element.three_days.total_received_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.three_days.total_received_amount.amount,
							0,
						);
					element.seven_days.total_received_amount.percentage =
						(Number(element.seven_days.total_received_amount.amount) * 100) /
						listAccountStats.reduce(
							(a: any, b: any) => a + b.seven_days.total_received_amount.amount,
							0,
						);

					// eslint-disable-next-line no-underscore-dangle
					if (element._id) {
						// eslint-disable-next-line no-underscore-dangle
						listUpdateQueries.push(this.adapter.updateById(element._id, element));
					} else {
						const item: AccountStatistics = new JsonConvert().deserializeObject(
							element,
							AccountStatistics,
						);
						listUpdateQueries.push(this.adapter.insert(item));
					}
				});
				await Promise.all(listUpdateQueries);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}

	onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
	}

	public async _start() {
		await this.broker.waitForServices(['v1.transaction-stats']);

		this.createJob(
			'crawl.account-stats',
			{
				id: null,
				listData: [],
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

		this.getQueue('crawl.account-stats').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed! result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.account-stats').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed! error: ${job.failedReason}`);
		});
		this.getQueue('crawl.account-stats').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
