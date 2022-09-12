import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { URL_TYPE_CONSTANTS, VESTING_ACCOUNT_TYPE } from '../../common/constant';
import { AccountInfoEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { Coin } from 'entities/coin.entity';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
const QueueService = require('moleculer-bull');

export default class HandleAccountVestingService extends Service {
	private dbAccountInfoMixin = dbAccountInfoMixin;
	private callApiMixin = new CallApiMixin().start();

	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAccountVesting',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.account-vesting',
					},
				),
				this.dbAccountInfoMixin,
				this.callApiMixin,
			],
			queues: {
				'handle.account-continuous-vesting': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_ACCOUNT_VESTING, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleContinuousVestingJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleContinuousVestingJob() {
		let listUpdateQueries: any[] = [];
		let continuousVestingAccounts = await this.adapter.find({
			query: {
				'account_auth.result.type': VESTING_ACCOUNT_TYPE.CONTINUOUS,
				'custom_info.chain_id': Config.CHAIN_ID,
			},
		});
		continuousVestingAccounts.map(async (account: any) => {
			if (
				new Date(
					parseInt(account.account_auth.result.value.base_vesting_account.end_time, 10) *
						1000,
				).getTime() >= new Date().getTime()
			) {
				let listSpendableBalances: Coin[] = [];
				const param =
					Config.GET_PARAMS_SPENDABLE_BALANCE +
					`/${account.address}?pagination.limit=100`;
				const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

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
				account.account_spendable_balances = listSpendableBalances;
				listUpdateQueries.push(this.adapter.updateById(account._id, account));
			}
		});
		await Promise.all(listUpdateQueries);
	}

	async _start() {
		this.createJob(
			'handle.account-continuous-vesting',
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_CONTINUOUS_VESTING, 10),
				},
			},
		);

		this.getQueue('handle.account-continuous-vesting').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.account-continuous-vesting').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('handle.account-continuous-vesting').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		return super._start();
	}
}
