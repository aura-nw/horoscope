/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { dbDailyTxStatisticsMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { CONST_CHAR, MSG_TYPE } from '../../common/constant';
import { DailyTxStatistics } from '../../entities';
import { JsonConvert } from 'json2typescript';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class CrawlDailyTxService extends Service {
	private dbDailyTxStatisticsMixin = dbDailyTxStatisticsMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlDailyTx',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbDailyTxStatisticsMixin,
			],
			queues: {
				'crawl.daily-tx': {
					concurrency: parseInt(Config.CONCURRENCY_DAILY_ACCOUNT_STATISTICS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(
							job.data.offset,
							job.data.txCount,
							job.data.activeAddrs,
						);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(offset: number, txCount: number, activeAddrs: string[]) {

		let listAddresses: string[] = [];

		const syncDate = new Date();
		syncDate.setDate(syncDate.getDate() - 1);
		const startTime = syncDate.setUTCHours(0, 0, 0, 0);
		const endTime = syncDate.setUTCHours(23, 59, 59, 999);
		let date = new Date(startTime);
		this.logger.info(`Get txs at paging ${offset + 1} for day ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);

		let query: any = {
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
				dailyTxs.map((txs: any) => {
					txs.tx.body.messages.map((message: any) => {
						switch (message['@type']) {
							case MSG_TYPE.MSG_SEND:
								listAddresses.push(message.from_address, message.to_address);
								break;
							case MSG_TYPE.MSG_DELEGATE:
								listAddresses.push(message.delegator_address);
								break;
							case MSG_TYPE.MSG_REDELEGATE:
								listAddresses.push(message.delegator_address);
								break;
							case MSG_TYPE.MSG_UNDELEGATE:
								listAddresses.push(message.delegator_address);
								break;
							case MSG_TYPE.MSG_EXECUTE_CONTRACT:
								listAddresses.push(message.sender);
								break;
							case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
								listAddresses.push(message.sender);
								break;
							case MSG_TYPE.MSG_STORE_CODE:
								listAddresses.push(message.sender);
								break;
							case MSG_TYPE.MSG_CREATE_VESTING_ACCOUNT:
								listAddresses.push(message.from_address, message.to_address);
								break;
							case MSG_TYPE.MSG_DEPOSIT:
								listAddresses.push(message.depositor);
								break;
							case MSG_TYPE.MSG_WITHDRAW_REWARDS:
								listAddresses.push(message.delegator_address);
								break;
							case MSG_TYPE.MSG_SUBMIT_PROPOSAL:
								listAddresses.push(message.proposer);
								break;
							case MSG_TYPE.MSG_VOTE:
								listAddresses.push(message.voter);
								break;
							case MSG_TYPE.MSG_IBC_TRANSFER:
								listAddresses.push(message.sender);
								break;
							case MSG_TYPE.MSG_IBC_RECEIVE:
								let data = JSON.parse(
									txs.tx_response.logs
										.find((log: any) =>
											log.events.find(
												(event: any) =>
													event.type === CONST_CHAR.RECV_PACKET,
											),
										)
										.events.find(
											(event: any) => event.type === CONST_CHAR.RECV_PACKET,
										)
										.attributes.find(
											(attribute: any) =>
												attribute.key === CONST_CHAR.PACKET_DATA,
										).value,
								);
								listAddresses.push(data.receiver);
								break;
							case MSG_TYPE.MSG_MULTI_SEND:
								listAddresses.push(message.inputs[0].address);
								message.outputs.map((output: any) => {
									listAddresses.push(output.address);
								});
								break;
						}
					});
				});
			} catch (error) {
				this.logger.error(error);
			}

			activeAddrs = activeAddrs.concat(listAddresses).filter(this.onlyUnique);

			const newOffset = offset + 1;
			txCount += dailyTxs.length;
			this.createJob(
				'crawl.daily-tx',
				{
					offset: newOffset,
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
				const [resultTotalAccs, previousDailyTx]: [any, DailyTxStatistics] = await Promise.all([
					this.broker.call('v1.account-stats.countTotal', {}),
					this.adapter.findOne({
						date: new Date(previousDay),
					}),
				]);

				let dailyTxStatistics: DailyTxStatistics = {} as DailyTxStatistics;
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
				this.logger.info(`Daily Blockchain Statistics for day ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`);
				this.logger.info(JSON.stringify(item));
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

	async _start() {
		this.createJob(
			'crawl.daily-tx',
			{
				offset: 0,
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
		return super._start();
	}
}
