import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { CONST_CHAR, MSG_TYPE } from '../../common/constant';
import { ListTxCreatedParams } from 'types';
import { ITransaction } from 'entities';
const QueueService = require('moleculer-bull');

export default class HandleAddressService extends Service {
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
					handler: async (ctx: any) => {
						this.logger.debug(`Crawl account info`);
						await this.handleJob(ctx.params.listTx, ctx.params.source, ctx.params.chainId);
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
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listTx: any[], source: string, chainId: string) {
		let listAddresses: any[] = [];
		let listUpdateInfo: string[] = [];
		if (listTx.length > 0) {
			for (const element of listTx) {
				let message;
				if (source == CONST_CHAR.CRAWL) {
					try {
						message = element.tx.body.messages[0]['@type'];
						listUpdateInfo.push(...[
							'account-info.upsert-balances',
							'account-info.upsert-spendable-balances'
						]);
					} catch (error) {
						this.logger.error(`Error when get message type: ${error}`);
						continue;
					}
				} else if (source == CONST_CHAR.API) {
					listAddresses.push(element.address);
					listUpdateInfo.push(...[
						'account-info.upsert-balances',
						'account-info.upsert-delegates',
						'account-info.upsert-redelegates',
						'account-info.upsert-spendable-balances',
						'account-info.upsert-unbonds'
					]);
				}

				switch (message) {
					case MSG_TYPE.MSG_SEND:
						listAddresses.push(
							element.tx.body.messages[0].from_address,
							element.tx.body.messages[0].to_address,
						);
						break;
					case MSG_TYPE.MSG_DELEGATE:
						listAddresses.push(element.tx.body.messages[0].delegator_address);
						listUpdateInfo.push('account-info.upsert-delegates');
						break;
					case MSG_TYPE.MSG_REDELEGATE:
						listAddresses.push(element.tx.body.messages[0].delegator_address);
						listUpdateInfo.push(...[
							'account-info.upsert-delegates',
							'account-info.upsert-redelegates'
						]);
						break;
					case MSG_TYPE.MSG_UNDELEGATE:
						listAddresses.push(element.tx.body.messages[0].delegator_address);
						listUpdateInfo.push(...[
							'account-info.upsert-delegates',
							'account-info.upsert-unbonds'
						]);
						break;
					case MSG_TYPE.MSG_EXECUTE_CONTRACT:
						listAddresses.push(element.tx.body.messages[0].sender);
						break;
					case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
						listAddresses.push(element.tx.body.messages[0].sender);
						break;
					case MSG_TYPE.MSG_STORE_CODE:
						listAddresses.push(element.tx.body.messages[0].sender);
						break;
					case MSG_TYPE.MSG_CREATE_VESTING_ACCOUNT:
						listAddresses.push(
							element.tx.body.messages[0].from_address,
							element.tx.body.messages[0].to_address,
						);
						break;
					case MSG_TYPE.MSG_DEPOSIT:
						listAddresses.push(element.tx.body.messages[0].depositor);
						break;
					case MSG_TYPE.MSG_WITHDRAW_REWARDS:
						listAddresses.push(element.tx.body.messages[0].delegator_address);
						break;
					case MSG_TYPE.MSG_SUBMIT_PROPOSAL:
						listAddresses.push(element.tx.body.messages[0].proposer);
						break;
					case MSG_TYPE.MSG_VOTE:
						listAddresses.push(element.tx.body.messages[0].voter);
						break;
				}
			}

			await this.broker.call('v1.crawlAccountAuthInfo.accountauthupsert', { listAddresses, chainId });
			listUpdateInfo.map(item => {
				this.broker.emit(item, { listAddresses, chainId });
			})
		}
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
