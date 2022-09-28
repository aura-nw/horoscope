import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import {
	DELAY_JOB_STATUS,
	DELAY_JOB_TYPE,
	LIST_NETWORK,
	URL_TYPE_CONSTANTS,
} from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import {
	UnbondingResponse,
	DelayJobEntity,
	AccountInfoEntity,
	ValidatorEntity,
} from '../../entities';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
import { mongoDBMixin } from '../../mixins/dbMixinMongoDB/mongodb.mixin';
const QueueService = require('moleculer-bull');
const Bull = require('bull');

export default class CrawlAccountUnbondsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;
	private mongoDBMixin = mongoDBMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountUnbonds',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.account-unbonds',
					},
				),
				// this.redisMixin,
				this.dbAccountInfoMixin,
				this.callApiMixin,
				this.mongoDBMixin,
			],
			queues: {
				'crawl.account-unbonds': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_UNBONDS, 10),
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
				'account-info.upsert-unbonds': {
					handler: (ctx: Context<CrawlAccountInfoParams>) => {
						this.logger.debug(`Crawl account unbonds`);
						this.createJob(
							'crawl.account-unbonds',
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

	async handleJob(listAddresses: string[], chainId: string) {
		this.mongoDBClient = await this.connectToDB();
		const db = this.mongoDBClient.db(Config.DB_GENERIC_DBNAME);
		let delayJob = await db.collection('delay_job');

		let listAccounts: AccountInfoEntity[] = [],
			listUpdateQueries: any[] = [],
			listDelayJobs: DelayJobEntity[] = [];
		chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (listAddresses.length > 0) {
			for (let address of listAddresses) {
				let listUnbonds: UnbondingResponse[] = [];

				const validators: ValidatorEntity[] = await this.broker.call(
					'v1.crawlValidator.find',
					{
						query: {
							'custom_info.chain_id': chainId,
						},
					},
				);

				const param =
					Config.GET_PARAMS_DELEGATOR +
					`/${address}/unbonding_delegations?pagination.limit=100`;
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

					listUnbonds.push(...resultCallApi.unbonding_responses);
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				listUnbonds.map((unbond) => {
					unbond.validator_description = validators.find(
						(validator) => validator.operator_address === unbond.validator_address,
					)?.description!;
				});

				if (listUnbonds) {
					accountInfo.account_unbonding = listUnbonds;
					listUnbonds.map((unbond: UnbondingResponse) => {
						let newDelayJob = {} as DelayJobEntity;
						newDelayJob.content = { address };
						newDelayJob.type = DELAY_JOB_TYPE.UNBOND;
						newDelayJob.expire_time = new Date(unbond.entries[0].completion_time!);
						newDelayJob.status = DELAY_JOB_STATUS.PENDING;
						newDelayJob.custom_info = {
							chain_id: chainId,
							chain_name: chain ? chain.chainName : '',
						};
						listDelayJobs.push(newDelayJob);
					});
				}

				listAccounts.push(accountInfo);
			}
		}
		try {
			listAccounts.forEach((element) => {
				if (element._id)
					listUpdateQueries.push(
						this.adapter.updateById(element._id, {
							$set: { account_unbonding: element.account_unbonding },
						}),
					);
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
			if (listDelayJobs.length > 0) listUpdateQueries.push(delayJob.insertMany(listDelayJobs));
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.getQueue('crawl.account-unbonds').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-unbonds').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-unbonds').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
