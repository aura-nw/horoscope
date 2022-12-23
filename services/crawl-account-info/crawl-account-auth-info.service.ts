/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
import { Job } from 'bull';
import { Service, ServiceBroker } from 'moleculer';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import {
	DELAY_JOB_TYPE,
	EVMOS_TYPE_ACCOUNT,
	LIST_NETWORK,
	URL_TYPE_CONSTANTS,
	VESTING_ACCOUNT_TYPE,
} from '../../common/constant';
import { Utils } from '../../utils/utils';
import { QueryDelayJobParams } from '../../types';
import { AccountInfoEntity, DelayJobEntity } from '../../entities';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountAuthInfoService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountAuthInfo',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbAccountInfoMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.account-auth-info': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_AUTH, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listAddresses, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	public async handleJob(listAddresses: string[], chainId: string) {
		const listAccounts: AccountInfoEntity[] = [];
		let listUpdateQueries: any[] = [];
		const listDelayJobs: DelayJobEntity[] = [];

		const network = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}

		if (listAddresses.length > 0) {
			for (const address of listAddresses) {
				this.logger.info(`Handle address: ${address}`);

				const param = Config.GET_PARAMS_AUTH_INFO + `/${address}`;
				const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

				let accountInfo: AccountInfoEntity;
				try {
					accountInfo = await this.adapter.findOne({
						address,
					});
				} catch (error) {
					this.logger.error(error);
					throw error;
				}

				let resultCallApi;
				try {
					resultCallApi = await this.callApiFromDomain(url, param);
				} catch (error) {
					this.logger.error(error);
					throw error;
				}

				if (
					resultCallApi &&
					resultCallApi.account &&
					resultCallApi.account['@type'] &&
					(resultCallApi.account['@type'] === VESTING_ACCOUNT_TYPE.PERIODIC ||
						resultCallApi.account['@type'] === VESTING_ACCOUNT_TYPE.DELAYED)
				) {
					let existsJob;
					try {
						existsJob = await this.broker.call('v1.delay-job.findOne', {
							address,
							type:
								resultCallApi.account['@type'] === VESTING_ACCOUNT_TYPE.PERIODIC
									? DELAY_JOB_TYPE.PERIODIC_VESTING
									: DELAY_JOB_TYPE.DELAYED_VESTING,
						} as QueryDelayJobParams);
					} catch (error) {
						this.logger.error(error);
						throw error;
					}
					if (!existsJob) {
						const newDelayJob = {} as DelayJobEntity;
						newDelayJob.content = { address };
						switch (resultCallApi.account['@type']) {
							case VESTING_ACCOUNT_TYPE.DELAYED:
								newDelayJob.type = DELAY_JOB_TYPE.DELAYED_VESTING;
								newDelayJob.expire_time = new Date(
									parseInt(
										resultCallApi.account.base_vesting_account.end_time,
										10,
									) * 1000,
								);
								break;
							case VESTING_ACCOUNT_TYPE.PERIODIC:
								newDelayJob.type = DELAY_JOB_TYPE.PERIODIC_VESTING;
								const start_time =
									parseInt(resultCallApi.account.start_time, 10) * 1000;
								const number_of_periods =
									(new Date().getTime() - start_time) /
									(parseInt(resultCallApi.account.vesting_periods[0].length, 10) *
										1000);
								let expire_time =
									start_time +
									number_of_periods *
									parseInt(
										resultCallApi.account.vesting_periods[0].length,
										10,
									) *
									1000;
								if (expire_time < new Date().getTime()) {
									expire_time +=
										parseInt(
											resultCallApi.account.vesting_periods[0].length,
											10,
										) * 1000;
								}
								newDelayJob.expire_time = new Date(expire_time);
								break;
						}
						newDelayJob.indexes = `${address}${newDelayJob.type
							}${newDelayJob?.expire_time?.getTime()}${chainId}`;
						newDelayJob.custom_info = {
							chain_id: chainId,
							chain_name: network ? network.chainName : '',
						};
						listDelayJobs.push(newDelayJob);
					}
				}

				if (
					resultCallApi &&
					resultCallApi.account &&
					resultCallApi.account['@type'] === EVMOS_TYPE_ACCOUNT.ETH_ACCOUNT
				) {
					if (resultCallApi.account.base_account) {
						resultCallApi.account.address = resultCallApi.account.base_account.address;
						resultCallApi.account.pub_key = resultCallApi.account.base_account.pub_key;
						resultCallApi.account.account_number =
							resultCallApi.account.base_account.account_number;
						resultCallApi.account.sequence =
							resultCallApi.account.base_account.sequence;
					}
				}
				accountInfo.account_auth = resultCallApi;

				listAccounts.push(accountInfo);
			}
		}

		try {
			listAccounts.map((element) => {
				listUpdateQueries.push(
					this.adapter.updateById(element._id, {
						$set: { account_auth: element.account_auth },
					}),
				);
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
		try {
			listUpdateQueries = [];
			listDelayJobs.map((element) => {
				listUpdateQueries.push(this.broker.call('v1.delay-job.addNewJob', element));
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async _start() {
		this.getQueue('crawl.account-auth-info').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-auth-info').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.account-auth-info').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
