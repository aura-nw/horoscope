/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
import { Job } from 'bull';
import { Service, ServiceBroker } from 'moleculer';
import { Coin } from 'entities/coin.entity';
import { ObjectId } from 'mongodb';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS, VESTING_ACCOUNT_TYPE } from '../../common/constant';
import { Utils } from '../../utils/utils';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleAccountVestingService extends Service {
	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAccountVesting',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbAccountInfoMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'handle.account-vesting': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_ACCOUNT_VESTING, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleVestingJob(job.data._id);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	public async handleVestingJob(_id: any) {
		const listUpdateQueries: any[] = [];
		const continuousVestingAccounts: any[] = [];
		try {
			let done = false;
			while (!done) {
				const query: any = {
					'account_auth.account.@type': [VESTING_ACCOUNT_TYPE.CONTINUOUS, VESTING_ACCOUNT_TYPE.PERIODIC],
				};
				if (_id !== null) { query._id = { $gt: new ObjectId(_id) }; }
				const accounts = await this.adapter.find({
					query,
					limit: 100,
				});
				if (accounts.length > 0) {
					continuousVestingAccounts.push(...accounts);
					_id = accounts[accounts.length - 1]._id;
				} else {
					done = true;
				}
				if (continuousVestingAccounts.length >= 1000) {
					done = true;
					this.createJob(
						'handle.account-vesting',
						{ _id },
						{
							removeOnComplete: true,
							removeOnFail: {
								count: 3,
							},
						},
					);
				}
			}

		} catch (error) {
			this.logger.error(error);
			throw error;
		}
		await Promise.all(
			continuousVestingAccounts.map(async (account: any) => {
				this.logger.info(`Handle address: ${account.address}`);

				if (
					new Date(
						parseInt(account.account_auth.account.base_vesting_account.end_time, 10) *
						1000,
					).getTime() >= new Date().getTime()
				) {
					const listSpendableBalances: Coin[] = [];
					const param =
						Config.GET_PARAMS_SPENDABLE_BALANCE +
						`/${account.address}?pagination.limit=100`;
					const url = Utils.getUrlByChainIdAndType(
						Config.CHAIN_ID,
						URL_TYPE_CONSTANTS.LCD,
					);

					let urlToCall = param;
					let done = false;
					let resultCallApi;
					while (!done) {
						try {
							resultCallApi = await this.callApiFromDomain(url, urlToCall);
						} catch (error) {
							this.logger.error(error);
							throw error;
						}

						if (resultCallApi.balances.length > 0) {
							listSpendableBalances.push(...resultCallApi.balances);
						}
						if (resultCallApi.pagination.next_key === null) {
							done = true;
						} else {
							urlToCall = `${param}&pagination.key=${encodeURIComponent(
								resultCallApi.pagination.next_key,
							)}`;
						}
					}
					// eslint-disable-next-line no-underscore-dangle
					listUpdateQueries.push(
						this.adapter.updateById(account._id, {
							$set: {
								account_spendable_balances: listSpendableBalances,
							},
						}),
					);
				}
			}),
		);

		try {
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
	}

	public async _start() {
		this.createJob(
			'handle.account-vesting',
			{ _id: null },
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_HANDLE_VESTING, 10),
				},
			},
		);

		this.getQueue('handle.account-vesting').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.account-vesting').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('handle.account-vesting').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
