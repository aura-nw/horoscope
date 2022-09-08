import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { DELAY_JOB_STATUS, DELAY_JOB_TYPE, LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { RedelegationResponse, DelayJobEntity, AccountInfoEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
const QueueService = require('moleculer-bull');
const Bull = require('bull');
const mongo = require('mongodb');

export default class CrawlAccountRedelegatesService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;

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
				this.dbAccountInfoMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-redelegates': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_REDELEGATIONS, 10),
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.listAddresses, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'account-info.upsert-redelegates': {
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
		let client = await this.connectToDB();
		const db = client.db(Config.DB_GENERIC_DBNAME);
		let delayJob = await db.collection("delay_job");

		let listAccounts: AccountInfoEntity[] = [],
			listUpdateQueries: any[] = [],
			listDelayJobs: DelayJobEntity[] = [];
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (listAddresses.length > 0) {
			for (let address of listAddresses) {
				let listRedelegates: RedelegationResponse[] = [];

				const param =
					Config.GET_PARAMS_DELEGATOR + `/${address}/redelegations?pagination.limit=100`;
				const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

				let accountInfo: AccountInfoEntity = await this.adapter.findOne({
					address,
					'custom_info.chain_id': chainId,
				});
				if (!accountInfo) {
					accountInfo = {} as AccountInfoEntity;
					accountInfo.address = address;
				}

				let urlToCall = param;
				let done = false;
				let resultCallApi;
				while (!done) {
					resultCallApi = await this.callApiFromDomain(url, urlToCall);

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
					accountInfo.account_redelegations = listRedelegates;
					listRedelegates.map(async (redelegate: RedelegationResponse) => {
						// let expireTime = new Date(
						// 	redelegate.entries[0].redelegation_entry.completion_time.toString(),
						// );
						// let delay = expireTime.getTime() - new Date().getTime();
						// const apiKeyQueue = new Bull(
						// 	'handle.address',
						// 	{
						// 		redis: {
						// 			host: Config.REDIS_HOST,
						// 			port: Config.REDIS_PORT,
						// 			username: Config.REDIS_USERNAME,
						// 			password: Config.REDIS_PASSWORD,
						// 			db: Config.REDIS_DB_NUMBER,
						// 		},
						// 		prefix: 'handle.address',
						// 		defaultJobOptions: {
						// 			jobId: `${address}_${chainId}_${redelegate.entries[0].redelegation_entry.completion_time}`,
						// 			removeOnComplete: true,
						// 			delay,
						// 		}
						// 	}
						// );
						// apiKeyQueue.add({
						// 	listTx: [address],
						// 	source: CONST_CHAR.API,
						// 	chainId
						// });
						let newDelayJob = {} as DelayJobEntity;
						newDelayJob.content = { address };
						newDelayJob.type = DELAY_JOB_TYPE.REDELEGATE;
						newDelayJob.expire_time = new Date(redelegate.entries[0].redelegation_entry.completion_time!);
						newDelayJob.status = DELAY_JOB_STATUS.PENDING;
						newDelayJob.custom_info = {
							chain_id: chainId,
							chain_name: chain ? chain.chainName : '',
						};
						listDelayJobs.push(newDelayJob);
					});
				}

				listAccounts.push(accountInfo);
			};
		}
		try {
			listAccounts.map((element) => {
				if (element._id)
					listUpdateQueries.push(this.adapter.updateById(element._id, { $set: { account_redelegations: element.account_redelegations } }));
				else {
					const item: AccountInfoEntity = new JsonConvert().deserializeObject(
						element,
						AccountInfoEntity,
					);
					item.custom_info = {
						chain_id: chainId,
						chain_name: chain ? chain.chainName : '',
					};
					listUpdateQueries.push(this.adapter.insert(item));
				}
			});
			listDelayJobs.map((element) => {
				listUpdateQueries.push(delayJob.insertMany([element]));
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async connectToDB() {
		const DB_URL = `mongodb://${Config.DB_GENERIC_USER}:${encodeURIComponent(Config.DB_GENERIC_PASSWORD)}@${Config.DB_GENERIC_HOST}:${Config.DB_GENERIC_PORT}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;

		let cacheClient = await mongo.MongoClient.connect(
			DB_URL,
		);
		return cacheClient;
	}

	async _start() {
		this.getQueue('crawl.account-redelegates').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-redelegates').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-redelegates').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
