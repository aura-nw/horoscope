/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose/db-account-info.mixin';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { CONST_CHAR, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { AccountInfoEntity } from '../../entities/account-info.entity';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Utils } from '../../utils/utils';
const QueueService = require('moleculer-bull');

export default class CrawlAccountInfoService extends Service {
	// private redisMixin = new RedisMixin().start();
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountInfo',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.account-info',
					},
				),
				// this.redisMixin,
				this.dbAccountInfoMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-info': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx, job.data.source);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				accountinfoupsert: {
					name: 'accountinfoupsert',
					rest: 'GET /account-info/:address',
					handler: async (ctx: any): Promise<any[]> => {
						this.logger.debug(`Crawl account info`);
						let result = await this.handleJob(ctx.params.listTx, ctx.params.source);
						return result;
					},
				},
			},
			events: {
				'account-info.upsert': {
					handler: (ctx: any) => {
						this.logger.debug(`Crawl account info`);
						this.createJob(
							'crawl.account-info',
							{
								listTx: ctx.params.listTx,
								source: ctx.params.source,
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

	async queryAllData(list: any[], result: any, api: string, data: string) {
		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		while (!done) {
			if (result) {
				list.push(...result[data]);
				if (result.pagination.next_key === null) {
					done = true;
				} else {
					let param = `${api}&pagination.key=${encodeURIComponent(
						result.pagination.next_key,
					)}`;
					result = await this.callApiFromDomain(url, param);
				}
			}
		}
	}

	async handleJob(listTx: any[], source: string): Promise<any[]> {
		let listAccounts: any[] = [],
			listUpdateQueries: any[] = [];
		if (listTx.length > 0) {
			for (const element of listTx) {
				let address, message;
				if (source == CONST_CHAR.CRAWL) {
					let log = element.tx_response.logs[0].events;
					address = log
						.find((x: any) => x.type == CONST_CHAR.MESSAGE)
						.attributes.find((x: any) => x.key == CONST_CHAR.SENDER).value;
					message = log
						.find((x: any) => x.type == CONST_CHAR.MESSAGE)
						.attributes.find((x: any) => x.key == CONST_CHAR.ACTION).value;
				} else if (source == CONST_CHAR.API) {
					address = element.address;
					message = element.message;
				}

				let listBalances: any[] = [];
				let listDelegates: any[] = [];
				let listRedelegates: any[] = [];
				let listUnbonds: any[] = [];
				let listSpendableBalances: any[] = [];
				let authInfo;

				const paramsBalance =
					Config.GET_PARAMS_BALANCE + `/${address}?pagination.limit=100`;
				const paramsDelegated =
					Config.GET_PARAMS_DELEGATE + `/${address}?pagination.limit=100`;
				const paramsUnbonding =
					Config.GET_PARAMS_DELEGATOR +
					`/${address}/unbonding_delegations?pagination.limit=100`;
				const paramsRedelegations =
					Config.GET_PARAMS_DELEGATOR + `/${address}/redelegations?pagination.limit=100`;
				const paramsAuthInfo = Config.GET_PARAMS_AUTH_INFO + `/${address}`;
				const paramsSpendableBalances =
					Config.GET_PARAMS_SPENDABLE_BALANCE + `/${address}?pagination.limit=100`;

				let accountInfo: AccountInfoEntity = await this.adapter.findOne({
					address,
				});
				const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

				let balanceData,
					delegatedData,
					unbondingData,
					redelegationsData,
					authInfoData,
					spendableBalances;
				if (accountInfo) {
					switch (message) {
						case MSG_TYPE.MSG_DELEGATE:
							[balanceData, delegatedData, authInfoData, spendableBalances] =
								await Promise.all([
									this.callApiFromDomain(url, paramsBalance),
									this.callApiFromDomain(url, paramsDelegated),
									this.callApiFromDomain(url, paramsAuthInfo),
									this.callApiFromDomain(url, paramsSpendableBalances),
								]);

							authInfo = authInfoData;

							await Promise.all([
								this.queryAllData(
									listBalances,
									balanceData,
									paramsBalance,
									CONST_CHAR.BALANCES,
								),
								this.queryAllData(
									listDelegates,
									delegatedData,
									paramsDelegated,
									CONST_CHAR.DELEGATION_RESPONSES,
								),
								this.queryAllData(
									listSpendableBalances,
									spendableBalances,
									paramsSpendableBalances,
									CONST_CHAR.BALANCES,
								),
							]);
							break;
						case MSG_TYPE.MSG_REDELEGATE:
							[
								balanceData,
								delegatedData,
								redelegationsData,
								authInfoData,
								spendableBalances,
							] = await Promise.all([
								this.callApiFromDomain(url, paramsBalance),
								this.callApiFromDomain(url, paramsDelegated),
								this.callApiFromDomain(url, paramsRedelegations),
								this.callApiFromDomain(url, paramsAuthInfo),
								this.callApiFromDomain(url, paramsSpendableBalances),
							]);

							authInfo = authInfoData;

							await Promise.all([
								this.queryAllData(
									listBalances,
									balanceData,
									paramsBalance,
									CONST_CHAR.BALANCES,
								),
								this.queryAllData(
									listDelegates,
									delegatedData,
									paramsDelegated,
									CONST_CHAR.DELEGATION_RESPONSES,
								),
								this.queryAllData(
									listRedelegates,
									redelegationsData,
									paramsRedelegations,
									CONST_CHAR.REDELEGATION_RESPONSES,
								),
								this.queryAllData(
									listSpendableBalances,
									spendableBalances,
									paramsSpendableBalances,
									CONST_CHAR.BALANCES,
								),
							]);
							break;
						case MSG_TYPE.MSG_UNDELEGATE:
							[
								balanceData,
								delegatedData,
								unbondingData,
								authInfoData,
								spendableBalances,
							] = await Promise.all([
								this.callApiFromDomain(url, paramsBalance),
								this.callApiFromDomain(url, paramsDelegated),
								this.callApiFromDomain(url, paramsUnbonding),
								this.callApiFromDomain(url, paramsAuthInfo),
								this.callApiFromDomain(url, paramsSpendableBalances),
							]);

							authInfo = authInfoData;

							await Promise.all([
								this.queryAllData(
									listBalances,
									balanceData,
									paramsBalance,
									CONST_CHAR.BALANCES,
								),
								this.queryAllData(
									listDelegates,
									delegatedData,
									paramsDelegated,
									CONST_CHAR.DELEGATION_RESPONSES,
								),
								this.queryAllData(
									listUnbonds,
									unbondingData,
									paramsUnbonding,
									CONST_CHAR.UNBONDING_RESPONSES,
								),
								this.queryAllData(
									listSpendableBalances,
									spendableBalances,
									paramsSpendableBalances,
									CONST_CHAR.BALANCES,
								),
							]);
							break;
						default:
							[balanceData, authInfoData, spendableBalances] = await Promise.all([
								this.callApiFromDomain(url, paramsBalance),
								this.callApiFromDomain(url, paramsAuthInfo),
								this.callApiFromDomain(url, paramsSpendableBalances),
							]);

							authInfo = authInfoData;

							await Promise.all([
								this.queryAllData(
									listBalances,
									balanceData,
									paramsBalance,
									CONST_CHAR.BALANCES,
								),
								this.queryAllData(
									listSpendableBalances,
									spendableBalances,
									paramsSpendableBalances,
									CONST_CHAR.BALANCES,
								),
							]);
							break;
					}
				} else {
					accountInfo = new AccountInfoEntity();
					[
						balanceData,
						delegatedData,
						unbondingData,
						redelegationsData,
						authInfoData,
						spendableBalances,
					] = await Promise.all([
						this.callApiFromDomain(url, paramsBalance),
						this.callApiFromDomain(url, paramsDelegated),
						this.callApiFromDomain(url, paramsUnbonding),
						this.callApiFromDomain(url, paramsRedelegations),
						this.callApiFromDomain(url, paramsAuthInfo),
						this.callApiFromDomain(url, paramsSpendableBalances),
					]);

					accountInfo.address = address;
					authInfo = authInfoData;

					await Promise.all([
						this.queryAllData(
							listBalances,
							balanceData,
							paramsBalance,
							CONST_CHAR.BALANCES,
						),
						this.queryAllData(
							listDelegates,
							delegatedData,
							paramsDelegated,
							CONST_CHAR.DELEGATION_RESPONSES,
						),
						this.queryAllData(
							listUnbonds,
							unbondingData,
							paramsUnbonding,
							CONST_CHAR.UNBONDING_RESPONSES,
						),
						this.queryAllData(
							listRedelegates,
							redelegationsData,
							paramsRedelegations,
							CONST_CHAR.REDELEGATION_RESPONSES,
						),
						this.queryAllData(
							listSpendableBalances,
							spendableBalances,
							paramsSpendableBalances,
							CONST_CHAR.BALANCES,
						),
					]);
				}

				if (listBalances) {
					accountInfo.balances = listBalances;
				}
				if (listDelegates) {
					accountInfo.delegation_responses = listDelegates;
				}
				if (listUnbonds) {
					accountInfo.unbonding_responses = listUnbonds;
				}
				if (listRedelegates) {
					accountInfo.redelegation_responses = listRedelegates;
				}
				if (listSpendableBalances) {
					accountInfo.spendable_balances = listSpendableBalances;
				}
				if (authInfo) {
					accountInfo.account = authInfo;
				}

				listAccounts.push(accountInfo);
			}
		}
		try {
			listAccounts.forEach((element) => {
				if (element._id)
					listUpdateQueries.push(this.adapter.updateById(element._id, element));
				else {
					const item: any = new JsonConvert().deserializeObject(
						element,
						AccountInfoEntity,
					);
					listUpdateQueries.push(this.adapter.insert(item));
				}
			});
			await Promise.all(listUpdateQueries);
			return listAccounts;
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async _start() {
		this.getQueue('crawl.account-info').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-info').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-info').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
