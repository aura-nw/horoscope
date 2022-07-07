import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountRedelegationsMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountRedelegationsEntity, RedelegationResponse } from '../../entities';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
const QueueService = require('moleculer-bull');

export default class CrawlAccountRedelegatesService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountRedelegationsMixin = dbAccountRedelegationsMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountRedelegates',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.account-redelegates',
					},
				),
				// this.redisMixin,
				this.dbAccountRedelegationsMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-redelegates': {
					concurrency: Config.CONCURRENCY_ACCOUNT_REDELEGATIONS,
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
				'account-info.upsert-each': {
					handler: (ctx: Context<CrawlAccountInfoParams>) => {
						this.logger.debug(`Crawl account redelegates`);
						this.createJob(
							'crawl.account-redelegates',
							{
								listAddresses: ctx.params.listAddresses,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listAddresses: string[], chainId: string) {
		let listAccounts: AccountRedelegationsEntity[] = [],
			listUpdateQueries: any[] = [];
		if (listAddresses.length > 0) {
			for (const address of listAddresses) {
				let listRedelegates: RedelegationResponse[] = [];

				const param =
					Config.GET_PARAMS_DELEGATOR + `/${address}/redelegations?pagination.limit=100`;
				const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

				let accountInfo: AccountRedelegationsEntity = await this.adapter.findOne({
					address,
					'custom_info.chain_id': chainId,
				});
				if (!accountInfo) {
					accountInfo = {} as AccountRedelegationsEntity;
					accountInfo.address = address;
				}

				let urlToCall = param;
				let done = false;
				let resultCallApi;
				while (!done) {
					resultCallApi = await this.callApiFromDomain(url, param);

					listRedelegates.push(...resultCallApi.redelegation_responses);
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				if (listRedelegates) {
					accountInfo.redelegation_responses = listRedelegates;
					listRedelegates.map((redelegate: RedelegationResponse) => {
						let expireTime = new Date(
							redelegate.entries[0].redelegation_entry.completion_time.toString(),
						);
						let delay = expireTime.getTime() - new Date().getTime();
						this.createJob(
							'crawl.account-unbonds',
							{
								listAddresses: [address],
								chainId
							},
							{
								removeOnComplete: true,
								delay,
							},
						);
					});
				}

				listAccounts.push(accountInfo);
			}
		}
		try {
			listAccounts.forEach((element) => {
				if (element._id)
					listUpdateQueries.push(this.adapter.updateById(element._id, element));
				else {
					const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
					const item: AccountRedelegationsEntity = new JsonConvert().deserializeObject(
						element,
						AccountRedelegationsEntity,
					);
					item.custom_info = {
						chain_id: chainId,
						chain_name: chain ? chain.chainName : '',
					};
					listUpdateQueries.push(this.adapter.insert(item));
				}
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.getQueue('crawl.account-delegates').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-delegates').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-delegates').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
