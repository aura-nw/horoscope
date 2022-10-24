/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { dbAccountStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { MSG_TYPE } from '../../common/constant';
import { AccountStatistics, DailyStats } from '../../entities';
import { JsonConvert } from 'json2typescript';
import { QueueConfig } from '../../config/queue';
import { Config } from '../../common';
const QueueService = require('moleculer-bull');

export default class CrawlAccountStatsService extends Service {
	private dbAccountStatisticsMixin = dbAccountStatisticsMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountStats',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbAccountStatisticsMixin,
			],
			queues: {
				'crawl.account-stats': {
					concurrency: parseInt(Config.CONCURRENCY_DAILY_TX_STATISTICS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.offset, job.data.listData);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(offset: number, listData: any[]) {
		let listAddresses: any[] = [],
			listUpdateQueries: any[] = [];

		const syncDate = new Date();
		syncDate.setDate(syncDate.getDate() - 1);
		const startTime = syncDate.setUTCHours(0, 0, 0, 0);
		const endTime = syncDate.setUTCHours(23, 59, 59, 999);

		let query: any = {
			'custom_info.chain_id': Config.CHAIN_ID,
			'indexes.message_action': {
				$in: [MSG_TYPE.MSG_SEND, MSG_TYPE.MSG_MULTI_SEND],
			},
			'indexes.timestamp': {
				$gte: new Date(startTime),
				$lte: new Date(endTime),
			},
		};

		const dailyTxs: any = await this.broker.call('v1.transaction-stats.act-find', {
			query,
			sort: '_id',
			limit: 100,
			offset: offset * 100,
		});
		this.logger.info(`Number of Txs retrieved at page ${offset + 1}: ${dailyTxs.length}`);

		if (dailyTxs.length > 0) {
			try {
				for (let txs of dailyTxs) {
					for (let message of txs.tx.body.messages) {
						switch (message['@type']) {
							case MSG_TYPE.MSG_SEND:
								listAddresses.push(message.from_address, message.to_address);
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
									).sent_amount += parseInt(message.amount[0].amount);
								} else {
									listData.push({
										address: message.from_address,
										sent_txs: 1,
										received_txs: 0,
										sent_amount: parseInt(message.amount[0].amount),
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
									).received_amount += parseInt(message.amount[0].amount);
								} else {
									listData.push({
										address: message.to_address,
										sent_txs: 0,
										received_txs: 1,
										sent_amount: 0,
										received_amount: parseInt(message.amount[0].amount),
									});
								}
								break;
							case MSG_TYPE.MSG_MULTI_SEND:
								listAddresses.push(message.inputs[0].address);
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
									).sent_amount += parseInt(message.inputs[0].coins[0].amount);
								} else {
									listData.push({
										address: message.inputs[0].address,
										sent_txs: 1,
										received_txs: 0,
										sent_amount: parseInt(message.inputs[0].coins[0].amount),
										received_amount: 0,
									});
								}
								message.outputs.map((output: any) => {
									listAddresses.push(output.address);
									if (
										listData.find(
											(item: any) => item.address === output.address,
										)
									) {
										listData.find(
											(item: any) => item.address === output.address,
										).received_txs += 1;
										listData.find(
											(item: any) => item.address === output.address,
										).received_amount += parseInt(output.coins[0].amount);
									} else {
										listData.push({
											address: output.address,
											sent_txs: 0,
											received_txs: 1,
											sent_amount: 0,
											received_amount: parseInt(output.coins[0].amount),
										});
									}
								});
								break;
						}
					}
				}
			} catch (error) {
				this.logger.error(error);
			}

			const newOffset = offset + 1;
			this.logger.info(`Next paging: ${newOffset + 1}`);
			this.createJob(
				'crawl.account-stats',
				{
					offset: newOffset,
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
			let listAccountStats: AccountStatistics[] = await this.adapter.find({
				query: {
					'custom_info.chain_id': Config.CHAIN_ID,
				},
			});
			listData.map((item: any) => {
				let account = listAccountStats.find(
					(account: AccountStatistics) => item.address === account.address,
				);
				if (account) {
					if (account.per_day.length === 7) account.per_day.shift();
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
					const last_three_days =
						account.per_day.length > 3 ? account.per_day.slice(-3) : account.per_day;
					account.three_days = {
						total_sent_tx: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: last_three_days.reduce(
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
					};
				} else {
					let accountStatistics: AccountStatistics = {} as AccountStatistics;
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
				if (!listData.find((item) => item.address == account.address)) {
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
					const last_three_days =
						account.per_day.length > 3 ? account.per_day.slice(-3) : account.per_day;
					account.three_days = {
						total_sent_tx: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_sent_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_received_tx: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_received_tx.amount,
								0,
							),
							percentage: 0,
						},
						total_sent_amount: {
							amount: last_three_days.reduce(
								(a: any, b: any) => a + b.total_sent_amount.amount,
								0,
							),
							percentage: 0,
						},
						total_received_amount: {
							amount: last_three_days.reduce(
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
					// total sent tx percentage
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

					// total received tx percentage
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

					// total sent amount percentage
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

					// total received amount percentage
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

					if (element._id)
						listUpdateQueries.push(this.adapter.updateById(element._id, element));
					else {
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

	async _start() {
		this.createJob(
			'crawl.account-stats',
			{
				offset: 0,
				listData: [],
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				// repeat: {
				// 	cron: '0 0 0 * * ?'
				// },
			},
		);

		this.getQueue('crawl.account-stats').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.account-stats').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.account-stats').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
