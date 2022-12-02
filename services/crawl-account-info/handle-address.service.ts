import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { CONST_CHAR, LIST_NETWORK } from '../../common/constant';
import { CrawlAccountClaimedRewardsParams, ListTxCreatedParams } from 'types';
import { AccountInfoEntity } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { fromBech32 } from '@cosmjs/encoding';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class HandleAddressService extends Service {
	private dbAccountInfoMixin = dbAccountInfoMixin;

	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAddress',
			version: 1,
			mixins: [QueueService(QueueConfig.redis, QueueConfig.opts), this.dbAccountInfoMixin],
			queues: {
				'handle.address': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_ADDRESS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx, job.data.source, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				accountinfoupsert: {
					name: 'accountinfoupsert',
					rest: 'GET /account-info/:address',
					handler: (ctx: any) => {
						this.logger.debug(`Crawl account info`);
						this.handleJob(ctx.params.listTx, ctx.params.source, ctx.params.chainId);
					},
				},
			},
			events: {
				'list-tx.upsert': {
					handler: (ctx: Context<ListTxCreatedParams>) => {
						this.logger.debug(`Handle address`);
						this.createJob(
							'handle.address',
							{
								listTx: ctx.params.listTx,
								source: ctx.params.source,
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

	async handleJob(listTx: any[], source: string, chainId: string) {
		let listAddresses: any[] = [],
			listUpdateInfo: string[] = [],
			listInsert: any[] = [];
		chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		listUpdateInfo.push(
			...[
				'account-info.upsert-auth',
				'account-info.upsert-balances',
				'account-info.upsert-delegates',
				'account-info.upsert-redelegates',
				'account-info.upsert-spendable-balances',
				'account-info.upsert-unbonds',
			],
		);
		if (listTx.length > 0) {
			this.logger.info(`Handle Txs: ${JSON.stringify(listTx)}`);

			for (const element of listTx) {
				if (source == CONST_CHAR.CRAWL) {
					element.tx_response.logs.map((log: any) => {
						try {
							let event = log.events
								.filter(
									(e: any) =>
										e.type == CONST_CHAR.COIN_RECEIVED ||
										e.type == CONST_CHAR.COIN_SPENT,
								)
								.map((e: any) => e.attributes)
								.map((e: any) =>
									e
										.filter(
											(x: any) =>
												x.key === CONST_CHAR.RECEIVER ||
												x.key === CONST_CHAR.SPENDER,
										)
										.map((x: any) => x.value),
								)
								.flat();
							event = event.filter(
								(e: string) => fromBech32(e).data.length === 20,
							);
							if (event) listAddresses.push(...event);
						} catch (error) {
							this.logger.error(error);
							throw error;
						}
					});
				} else if (source == CONST_CHAR.API) {
					listAddresses.push(element.address);
				}
			}

			let listUniqueAddresses = listAddresses.filter(this.onlyUnique);
			if (listUniqueAddresses.length > 0) {
				try {
					listUniqueAddresses.map((address) => {
						const account: AccountInfoEntity = {} as AccountInfoEntity;
						account.address = address;
						const item: AccountInfoEntity = new JsonConvert().deserializeObject(
							account,
							AccountInfoEntity,
						);
						item.custom_info = {
							chain_id: chainId,
							chain_name: chain ? chain.chainName : '',
						};
						listInsert.push({ insertOne: { document: item } });
					});
					if (chain && chain.databaseName) {
						this.adapter.useDb(chain.databaseName);
					}
					const result = await this.adapter.bulkWrite(listInsert);
					this.logger.info(`${JSON.stringify(result)}`);
				} catch (error) {
					this.logger.error(`Account(s) already exists`);
				}
				listUpdateInfo.map((item) => {
					this.broker.emit(item, { listAddresses: listUniqueAddresses, chainId });
				});
			}
			if (source !== CONST_CHAR.API)
				this.broker.emit('account-info.upsert-claimed-rewards', {
					listTx,
					chainId,
				} as CrawlAccountClaimedRewardsParams);
		}
	}

	onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
	}

	async _start() {
		this.getQueue('handle.address').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('handle.address').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('handle.address').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
