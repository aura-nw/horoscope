import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountSpendableBalancesMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountSpendableBalancesEntity } from '../../entities/account-spendable-balances.entity';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
import { Coin } from '../../entities/coin.entity';
const QueueService = require('moleculer-bull');

export default class CrawlAccountSpendableBalancesService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountSpendableBalancesMixin = dbAccountSpendableBalancesMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountSpendableBalances',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.account-spendable-balances',
					},
				),
				// this.redisMixin,
				this.dbAccountSpendableBalancesMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-spendable-balances': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_SPENDABLE_BALANCES, 10),
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
				'account-info.upsert-each': {
					handler: (ctx: Context<CrawlAccountInfoParams>) => {
						this.logger.debug(`Crawl account spendable balances`);
						this.createJob(
							'crawl.account-spendable-balances',
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
		let listAccounts: AccountSpendableBalancesEntity[] = [],
			listUpdateQueries: any[] = [];
		if (listAddresses.length > 0) {
			listAddresses.map(async (address) => {
				let listSpendableBalances: Coin[] = [];

				const param =
					Config.GET_PARAMS_SPENDABLE_BALANCE + `/${address}?pagination.limit=100`;
				const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

				let accountInfo: AccountSpendableBalancesEntity = await this.adapter.findOne({
					address,
					'custom_info.chain_id': chainId,
				});
				if (!accountInfo) {
					accountInfo = {} as AccountSpendableBalancesEntity;
				}

				let urlToCall = param;
				let done = false;
				let resultCallApi;
				while (!done) {
					resultCallApi = await this.callApiFromDomain(url, urlToCall);

					listSpendableBalances.push(...resultCallApi.balances);
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				if (listSpendableBalances) {
					accountInfo.spendable_balances = listSpendableBalances;
					accountInfo.address = address;
				}

				listAccounts.push(accountInfo);
			});
		}
		try {
			listAccounts.map((element) => {
				if (element._id)
					listUpdateQueries.push(this.adapter.updateById(element._id, element));
				else {
					const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
					const item: AccountSpendableBalancesEntity =
						new JsonConvert().deserializeObject(
							element,
							AccountSpendableBalancesEntity,
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
		this.getQueue('crawl.account-spendable-balances').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-spendable-balances').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-spendable-balances').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
