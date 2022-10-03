import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams } from '../../types';
import { Coin } from '../../entities/coin.entity';
import { AccountInfoEntity, IBCDenomEntity } from '../../entities';
const QueueService = require('moleculer-bull');
import QueueConfig from '../../config/queue';

export default class CrawlAccountBalancesService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountBalances',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				// this.redisMixin,
				this.dbAccountInfoMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-balances': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_BALANCES, 10),
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
				'account-info.upsert-balances': {
					handler: (ctx: Context<CrawlAccountInfoParams>) => {
						this.logger.debug(`Crawl account balances`);
						this.createJob(
							'crawl.account-balances',
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
		let listAccounts: AccountInfoEntity[] = [],
			listUpdateQueries: any[] = [];
		chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (listAddresses.length > 0) {
			for (let address of listAddresses) {
				let listBalances: any[] = [];

				const param = Config.GET_PARAMS_BALANCE + `/${address}?pagination.limit=100`;
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

					listBalances.push(...resultCallApi.balances);
					if (resultCallApi.pagination.next_key === null) {
						done = true;
					} else {
						urlToCall = `${param}&pagination.key=${encodeURIComponent(
							resultCallApi.pagination.next_key,
						)}`;
					}
				}

				if (listBalances) {
					if (listBalances.length > 1) {
						await Promise.all(
							listBalances.map(async (balance) => {
								if (balance.denom.startsWith('ibc/')) {
									let hash = balance.denom.split('/')[1];
									let ibcDenom: IBCDenomEntity = await this.broker.call(
										'v1.ibc-denom.getByHash',
										{ hash: balance.denom, denom: '' },
									);
									if (ibcDenom) {
										balance.denom = ibcDenom.denom;
										balance.minimal_denom = ibcDenom.hash;
									} else {
										const hashParam = Config.GET_PARAMS_IBC_DENOM + `/${hash}`;
										let denomResult = await this.callApiFromDomain(
											url,
											hashParam,
										);
										balance.minimal_denom = balance.denom;
										balance.denom = denomResult.denom_trace.base_denom;
										this.broker.call('v1.ibc-denom.addNewDenom', {
											hash: `ibc/${hash}`,
											denom: balance.denom,
										});
									}
								}
							}),
						);
					}
					accountInfo.account_balances = listBalances;
				}

				listAccounts.push(accountInfo);
			}
		}
		try {
			listAccounts.map((element) => {
				if (element._id)
					listUpdateQueries.push(
						this.adapter.updateById(element._id, {
							$set: { account_balances: element.account_balances },
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
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.getQueue('crawl.account-balances').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-balances').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-balances').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'crawl.account-balances' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
