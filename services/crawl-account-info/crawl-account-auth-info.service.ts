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
					resultCallApi.account['@type'] === VESTING_ACCOUNT_TYPE.DELAYED
				) {
					const newDelayJob = {} as DelayJobEntity;
					newDelayJob.content = { address };
					newDelayJob.type = DELAY_JOB_TYPE.DELAYED_VESTING;
					newDelayJob.expire_time = new Date(
						parseInt(resultCallApi.account.base_vesting_account.end_time, 10) * 1000,
					);
					newDelayJob.custom_info = {
						chain_id: chainId,
						chain_name: network ? network.chainName : '',
					};
					listDelayJobs.push(newDelayJob);
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
				listUpdateQueries.push(
					this.broker.call('v1.delay-job.addNewJob', { ...element, chainId }),
				);
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	public async _start() {
		await this.broker.waitForServices(['v1.delay-job']);

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
