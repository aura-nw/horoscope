import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE } from '../../common/constant';
import { CrawlAccountClaimedRewardsParams, ListTxCreatedParams } from 'types';
import { AccountInfoEntity, ITransaction } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
const QueueService = require('moleculer-bull');

export default class HandleAddressService extends Service {
	private dbAccountInfoMixin = dbAccountInfoMixin;

	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAddress',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.address',
					},
				),
				this.dbAccountInfoMixin,
			],
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
			for (const element of listTx) {
				if (source == CONST_CHAR.CRAWL) {
					// listUpdateInfo.push(...[
					// 	'account-info.upsert-balances',
					// 	'account-info.upsert-spendable-balances'
					// ]);
					try {
						element.tx.body.messages.map((message: any) => {
							switch (message['@type']) {
								case MSG_TYPE.MSG_SEND:
									listAddresses.push(
										message.from_address,
										message.to_address,
									);
									break;
								case MSG_TYPE.MSG_DELEGATE:
									listAddresses.push(message.delegator_address);
									// listUpdateInfo.push('account-info.upsert-delegates');
									break;
								case MSG_TYPE.MSG_REDELEGATE:
									listAddresses.push(message.delegator_address);
									// listUpdateInfo.push(...[
									// 	'account-info.upsert-delegates',
									// 	'account-info.upsert-redelegates'
									// ]);
									break;
								case MSG_TYPE.MSG_UNDELEGATE:
									listAddresses.push(message.delegator_address);
									// listUpdateInfo.push(...[
									// 	'account-info.upsert-delegates',
									// 	'account-info.upsert-unbonds'
									// ]);
									break;
								case MSG_TYPE.MSG_EXECUTE_CONTRACT:
									listAddresses.push(message.sender);
									break;
								case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
									listAddresses.push(message.sender);
									break;
								case MSG_TYPE.MSG_STORE_CODE:
									listAddresses.push(message.sender);
									break;
								case MSG_TYPE.MSG_CREATE_VESTING_ACCOUNT:
									listAddresses.push(
										message.from_address,
										message.to_address,
									);
									break;
								case MSG_TYPE.MSG_DEPOSIT:
									listAddresses.push(message.depositor);
									break;
								case MSG_TYPE.MSG_WITHDRAW_REWARDS:
									listAddresses.push(message.delegator_address);
									break;
								case MSG_TYPE.MSG_SUBMIT_PROPOSAL:
									listAddresses.push(message.proposer);
									break;
								case MSG_TYPE.MSG_VOTE:
									listAddresses.push(message.voter);
									break;
								case MSG_TYPE.MSG_IBC_TRANSFER:
									listAddresses.push(message.sender);
									break;
								case MSG_TYPE.MSG_IBC_RECEIVE:
									let data = JSON.parse(element.tx_response.logs.find((log: any) =>
										log.events.find((event: any) => event.type === CONST_CHAR.RECV_PACKET)).events
										.find((event: any) => event.type === CONST_CHAR.RECV_PACKET).attributes
										.find((attribute: any) => attribute.key === CONST_CHAR.PACKET_DATA).value);
									listAddresses.push(data.receiver);
									break;
								case MSG_TYPE.MSG_MULTI_SEND:
									listAddresses.push(message.inputs[0].address);
									message.outputs.map((output: any) => {
										listAddresses.push(output.address);
									});
									break;
							}
						});
					} catch (error) {
						this.logger.error(`Error when get message type: ${error}`);
						continue;
					}
				} else if (source == CONST_CHAR.API) {
					listAddresses.push(element.address);
					// listUpdateInfo.push(...[
					// 	'account-info.upsert-balances',
					// 	'account-info.upsert-delegates',
					// 	'account-info.upsert-redelegates',
					// 	'account-info.upsert-spendable-balances',
					// 	'account-info.upsert-unbonds'
					// ]);
				}
			}

			let listUniqueAddresses = listAddresses.filter(this.onlyUnique);
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
				const result = await this.adapter.bulkWrite(listInsert);
				this.logger.info(`${JSON.stringify(result)}`);
			} catch (error) {
				this.logger.error(`Account(s) already exists`);
			}
			listUpdateInfo.map((item) => {
				this.broker.emit(item, { listAddresses: listUniqueAddresses, chainId });
			});
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
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('handle.address').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
