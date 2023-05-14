/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle, camelcase */
/* eslint-disable prettier/prettier */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { Utils } from '../../utils/utils';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE } from '../../common/constant';
import { AccountInfoEntity } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleAddressService extends Service {
	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAddress',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbAccountInfoMixin],
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
						this.logger.debug('Crawl account info');
						this.handleJob(ctx.params.listTx, ctx.params.source, ctx.params.chainId);
					},
				},
			},
		});
	}

	public async handleJob(listTx: any[], source: string, chainId: string) {
		const listAddresses: any[] = [];
		let listUpdateInfo = [
			'crawl.account-auth-info',
			'crawl.account-balances',
			'crawl.account-spendable-balances',
		];
		const listInsert: any[] = [];
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (listTx.length > 0) {
			this.logger.info(`Handle Txs: ${JSON.stringify(listTx)}`);

			for (const element of listTx) {
				if (source === CONST_CHAR.CRAWL) {
					element.tx_response.logs.map((log: any) => {
						try {
							let event = log.events
								.filter(
									(e: any) =>
										e.type === CONST_CHAR.COIN_RECEIVED ||
										e.type === CONST_CHAR.COIN_SPENT ||
										e.type === CONST_CHAR.MESSAGE,
								)
								.map((e: any) => e.attributes)
								.map((e: any) =>
									e
										.filter(
											(x: any) =>
												x.key === CONST_CHAR.RECEIVER ||
												x.key === CONST_CHAR.SPENDER ||
												x.key === CONST_CHAR.SENDER,
										)
										.map((x: any) => x.value),
								)
								.flat();
							event = event.filter((e: string) =>
								Utils.isValidAccountAddress(e, Config.NETWORK_PREFIX_ADDRESS, 20),
							);
							if (event) {
								listAddresses.push(...event);
							}
						} catch (error) {
							this.logger.error(error);
							throw error;
						}
					});
					try {
						let blockEvent = element.tx_response.events
							.filter(
								(e: any) =>
									e.type === CONST_CHAR.COIN_RECEIVED ||
									e.type === CONST_CHAR.COIN_SPENT ||
									e.type === CONST_CHAR.MESSAGE,
							)
							.map((e: any) => e.attributes)
							.map((e: any) =>
								e
									.filter(
										(x: any) =>
											x.key === btoa(CONST_CHAR.RECEIVER) ||
											x.key === btoa(CONST_CHAR.SPENDER) ||
											x.key === btoa(CONST_CHAR.SENDER),
									)
									.map((x: any) => atob(x.value)),
							)
							.flat();
						blockEvent = blockEvent.filter((e: string) =>
							Utils.isValidAccountAddress(e, Config.NETWORK_PREFIX_ADDRESS, 20),
						);
						if (blockEvent) {
							listAddresses.push(...blockEvent);
						}
					} catch (error) {
						this.logger.error(error);
						throw error;
					}

					element.tx.body.messages.map((msg: any) => {
						switch (msg['@type']) {
							case MSG_TYPE.MSG_DELEGATE:
								listUpdateInfo.push('crawl.account-delegates');
								break;
							case MSG_TYPE.MSG_REDELEGATE:
								listUpdateInfo.push(
									...['crawl.account-delegates', 'crawl.account-redelegates'],
								);
								break;
							case MSG_TYPE.MSG_UNDELEGATE:
								listUpdateInfo.push(
									...['crawl.account-delegates', 'crawl.account-unbonds'],
								);
								break;
							default:
								listUpdateInfo.push(
									...[
										'crawl.account-delegates',
										'crawl.account-redelegates',
										'crawl.account-unbonds',
									],
								);
								break;
						}
					});
				} else if (source === CONST_CHAR.API) {
					listAddresses.push(element.address);
					listUpdateInfo.push(
						...[
							'crawl.account-delegates',
							'crawl.account-redelegates',
							'crawl.account-unbonds',
						],
					);
				}
			}

			// Filter any invalid and duplicate addresses
			const listUniqueAddresses = listAddresses
				.filter(this._onlyUnique)
				.filter((addr: string) =>
					Utils.isValidAccountAddress(addr, Config.NETWORK_PREFIX_ADDRESS, 20),
				);
			// Filter list jobs to remove duplicates (if any)
			listUpdateInfo = listUpdateInfo.filter(this._onlyUnique);
			if (chain && chain.databaseName) {
				this.adapter.useDb(chain.databaseName);
			}
			const existedAccounts: AccountInfoEntity[] = (
				await this.adapter.find({
					query: {
						address: {
							$in: listUniqueAddresses,
						},
					},
				})
			).map((account: AccountInfoEntity) => account.address);

			if (listUniqueAddresses.length > 0) {
				try {
					listUniqueAddresses.map((address) => {
						if (!existedAccounts.includes(address)) {
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
						}
					});
					if (chain && chain.databaseName) {
						this.adapter.useDb(chain.databaseName);
					}
					const result = await this.adapter.bulkWrite(listInsert);
					this.logger.info(`${JSON.stringify(result)}`);
				} catch (error) {
					this.logger.error(error);
				}
				listUpdateInfo.map((item) => {
					this.createJob(
						item,
						{ listAddresses: listUniqueAddresses, chainId },
						{
							removeOnComplete: true,
							removeOnFail: {
								count: 10,
							},
							attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
						},
					);
				});
			}
			if (source !== CONST_CHAR.API) {
				this.createJob(
					'crawl.account-claimed-rewards',
					{ listTx },
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 10,
						},
						attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
					},
				);
			}
		}
	}

	private _onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
	}

	public async _start() {
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
