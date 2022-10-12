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
						await this.handleJob(job.data.offset, job.data.activeAddrs);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(offset: number, activeAddrs: string[]) {
		let listAddresses: string[] = [];

		const syncDate = new Date();
		syncDate.setDate(syncDate.getDate() - 1);
		const startTime = syncDate.setUTCHours(0, 0, 0, 0);
		const endTime = syncDate.setUTCHours(23, 59, 59, 999);

		let query: any = {
			'custom_info.chain_id': Config.CHAIN_ID,
			'indexes.timestamp': {
				$gte: new Date(startTime),
				$lte: new Date(endTime),
			}
		};

		const [dailyTxs, resultTotalAccs, currentStats]: [any, any, any] = await Promise.all([
			this.broker.call('v1.transaction-stats.find', {
				query,
				sort: '_id',
				limit: 100,
				offset: offset * 100
			}),
			this.broker.call('v1.account-stats.countTotal', {
				chain_id: Config.CHAIN_ID,
			}),
			this.adapter.findOne({
				'custom_info.chain_id': Config.CHAIN_ID,
				date: new Date(startTime),
			})
		]);
		this.logger.info(`Number of Txs retrieved at page ${offset + 1}: ${dailyTxs.length}`);

		if (dailyTxs.length > 0) {
			try {
				dailyTxs.map((txs: any) => {
					txs.tx.body.messages.map((message: any) => {
						switch (message['@type']) {
							case MSG_TYPE.MSG_SEND:
								listAddresses.push(
									message.from_address,
									message.to_address,
								);
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
								listAddresses.push(
									message.from_address,
									message.to_address,
								);
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
								let data = JSON.parse(txs.tx_response.logs.find((log: any) =>
									log.events.find((event: any) => event.type === CONST_CHAR.RECV_PACKET)).events
									.find((event: any) => event.type === CONST_CHAR.RECV_PACKET).attributes
									.find((attribute: any) => attribute.key === CONST_CHAR.PACKET_DATA).value);
								listAddresses.push(data.receiver);
								break;
							case MSG_TYPE.MSG_MULTI_SEND:
								listAddresses.push(message.inputs[0].address);
								message.outputs.map((output: any) => {
									listAddresses.push(output.address);
								});
								break;
						}
					})
				});
			} catch (error) {
				this.logger.error(error);
			}

			activeAddrs = activeAddrs.concat(listAddresses);
			if (currentStats) {
				currentStats.daily_txs += dailyTxs.length;
				currentStats.daily_active_addresses = activeAddrs.filter(this.onlyUnique).length;
				await this.adapter.updateById(currentStats._id, currentStats);
			} else {
				let dailyTxStatistics: DailyTxStatistics = {} as DailyTxStatistics;
				dailyTxStatistics.daily_txs = dailyTxs.length;
				dailyTxStatistics.daily_active_addresses = activeAddrs.filter(this.onlyUnique).length;
				dailyTxStatistics.unique_addresses = resultTotalAccs;
				dailyTxStatistics.date = new Date(startTime);
				const item: DailyTxStatistics = new JsonConvert().deserializeObject(
					dailyTxStatistics,
					DailyTxStatistics,
				);
				await this.adapter.insert(item);
			}

			const newOffset = offset + 1;
			this.logger.info(`Next paging: ${newOffset + 1}`);
			this.createJob(
				'crawl.daily-tx',
				{
					offset: newOffset,
					activeAddrs,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 3,
					},
				}
			);
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
				activeAddrs: [],
			},
			{
				jobId: 'crawl.daily-tx',
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					cron: '0 0 0 * * ?'
				},
			},
		);

		this.getQueue('crawl.daily-tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.daily-tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.daily-tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}