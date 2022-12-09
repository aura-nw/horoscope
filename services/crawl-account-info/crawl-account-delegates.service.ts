import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { fromBech32 } from '@cosmjs/encoding';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
import { AccountInfoEntity, DelegationResponse } from '../../entities';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountDelegatesService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountDelegates',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				// This.redisMixin,
				dbAccountInfoMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.account-delegates': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_DELEGATIONS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listAddresses, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'account-info.upsert-delegates': {
					handler: (ctx: Context<CrawlAccountInfoParams>) => {
						this.logger.debug('Crawl account delegates');
						this.createJob(
							'crawl.account-delegates',
							{
								listAddresses: ctx.params.listAddresses,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
								removeOnFail: {
									count: 10,
								},
							},
						);
						return;
					},
				},
			},
		});
	}

	public async handleJob(listAddresses: string[], chainId: string) {
		const listAccounts: AccountInfoEntity[] = [];
		const listUpdateQueries: any[] = [];
		chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
		const network = LIST_NETWORK.find((x) => x.chainId === chainId);
		listAddresses = listAddresses.filter((addr: string) => fromBech32(addr).data.length === 20);
		if (listAddresses.length > 0) {
			for (const address of listAddresses) {
				this.logger.info(`Handle address: ${address}`);

				const listDelegates: DelegationResponse[] = [];

				const param = Config.GET_PARAMS_DELEGATE + `/${address}?pagination.limit=100`;
				const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
				if (network && network.databaseName) {
					this.adapter.useDb(network.databaseName);
				}
				let accountInfo: AccountInfoEntity;
				try {
					accountInfo = await this.adapter.findOne({
						address,
					});
				} catch (error) {
					this.logger.error(error);
					throw error;
				}
				if (!accountInfo) {
					accountInfo = {} as AccountInfoEntity;
					accountInfo.address = address;
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

					if (resultCallApi.delegation_responses.length > 0) {
						listDelegates.push(...resultCallApi.delegation_responses);
					}
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				if (listDelegates) {
					// eslint-disable-next-line camelcase
					accountInfo.account_delegations = listDelegates;
				}

				listAccounts.push(accountInfo);
			}
		}
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		try {
			/* eslint-disable camelcase, no-underscore-dangle */

			listAccounts.map((element) => {
				if (element._id) {
					listUpdateQueries.push(
						this.adapter.updateById(element._id, {
							$set: { account_delegations: element.account_delegations },
						}),
					);
				} else {
					const item: AccountInfoEntity = new JsonConvert().deserializeObject(
						element,
						AccountInfoEntity,
					);
					item.custom_info = {
						chain_id: chainId,
						chain_name: network ? network.chainName : '',
					};
					listUpdateQueries.push(this.adapter.insert(item));
				}
			}); /* eslint-enable camelcase, no-underscore-dangle */
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public async _start() {
		this.getQueue('crawl.account-delegates').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-delegates').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.account-delegates').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
