/* eslint-disable prettier/prettier */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
import { Job } from 'bull';
import { Service, ServiceBroker } from 'moleculer';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { DELAY_JOB_TYPE, LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { UnbondingResponse, DelayJobEntity, AccountInfoEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountUnbondsService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountUnbonds',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbAccountInfoMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.account-unbonds': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_UNBONDS, 10),
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

				const listUnbonds: UnbondingResponse[] = [];

				const param =
					Config.GET_PARAMS_DELEGATOR +
					`/${address}/unbonding_delegations?pagination.limit=100`;
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

				let urlToCall = param;
				let done = false;
				let resultCallApi;
				while (!done) {
					try {
						resultCallApi = await this.callApiFromDomain(url, urlToCall);
					} catch (error) {
						this.logger.error(error);
						throw error;
					}

					if (resultCallApi.unbonding_responses.length > 0) {
						listUnbonds.push(...resultCallApi.unbonding_responses);
					}
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				if (listUnbonds.length > 0) {
					listUnbonds.map((unbond: UnbondingResponse) => {
						const newDelayJob = {} as DelayJobEntity;
						newDelayJob.content = { address };
						newDelayJob.type = DELAY_JOB_TYPE.UNBOND;
						newDelayJob.expire_time = new Date(unbond.entries[0].completion_time!);
						newDelayJob.indexes = `${address}${newDelayJob.type
							}${newDelayJob?.expire_time.getTime()}${chainId}`;

						newDelayJob.custom_info = {
							chain_id: chainId,
							chain_name: network ? network.chainName : '',
						};
						listDelayJobs.push(newDelayJob);
					});
				}
				accountInfo.account_unbonding = listUnbonds;

				listAccounts.push(accountInfo);
			}
		}
		try {
			listAccounts.forEach((element) => {
				listUpdateQueries.push(
					this.adapter.updateById(element._id, {
						$set: { account_unbonding: element.account_unbonding },
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
		await this.broker.waitForServices(['v1.delay-job']);

		this.getQueue('crawl.account-unbonds').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-unbonds').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.account-unbonds').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
