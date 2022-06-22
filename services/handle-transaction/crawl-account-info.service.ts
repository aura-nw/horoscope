/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { dbAccountInfoMixin } from "@Mixins/dbMixinMongoose/db-account-info.mixin";
import RedisMixin from "@Mixins/redis/redis.mixin";
import { Config } from "../../common";
import { Service, ServiceBroker } from "moleculer";
import { Job } from "bull";
import { CONST_CHAR, MSG_TYPE, URL_TYPE_CONSTANTS } from "common/constant";
const QueueService = require('moleculer-bull');

export default class CrawlAccountInfoService extends Service {
    private redisMixin = new RedisMixin().start();
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
                this.redisMixin,
                this.dbAccountInfoMixin,
            ],
            queues: {
                'crawl.account-info': {
                    concurrency: 1,
                    async process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        await this.handleJob(job.data.listTx);
                        job.progress(100);
                        return true;
                    },
                }
            },
            events: {
                'account-info.upsert': {
                    handler: (ctx: any) => {
                        this.logger.debug(`Crawl account info`);
                        this.createJob(
                            'crawl.account-info',
                            {
                                listTx: []
                            },
                            {
                                removeOnComplete: true,
                            },
                        );
                        return;
                    }
                }
            }
        })
    }

    async queryAllData(list: any[], result: any, url: string, data: string) {
        let done = false;
        while (!done) {
            if (result) {
                list.push(...result[data]);
                if (result.pagination.next_key === null) {
                    done = true;
                } else {
                    let param = `${url}&pagination.key=${encodeURIComponent(result.pagination.next_key)}`;
                    result = await this.callApi(URL_TYPE_CONSTANTS.LCD, param);
                }
            }
        }
    }

    async handleJob(listTx: any[]) {
        let listAccounts: any[] = [];
        if (listTx.length > 0) {
            listTx.forEach(async (element: any) => {
                let address = Buffer.from(
                    element.tx_result.events.find(
                        (x: any) => x.type == CONST_CHAR.TRANSFER
                    ).attributes.find(
                        (x: any) => x.key == Buffer.from(CONST_CHAR.SENDER).toString('base64')
                    ).value,
                    'base64'
                ).toString('ascii');
                let message = Buffer.from(
                    element.tx_result.events.find(
                        (x: any) => x.type == CONST_CHAR.MESSAGE
                    ).attributes.find(
                        (x: any) => x.key == Buffer.from(CONST_CHAR.ACTION).toString('base64')
                    ).value,
                    'base64'
                ).toString('ascii');
                let listBalances: any[] = [];
                let listDelegates: any[] = [];
                let listRedelegates: any[] = [];
                let listUnbonds: any[] = [];
                let listSpendableBalances: any[] = [];
                let authInfo;

                const paramsBalance = `cosmos/bank/v1beta1/balances/${address}?pagination.limit=100`;
                const paramsDelegated = `cosmos/staking/v1beta1/delegations/${address}?pagination.limit=100`;
                const paramsUnbonding = `cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations?pagination.limit=100`;
                const paramsRedelegations = `cosmos/staking/v1beta1/delegators/${address}/redelegations?pagination.limit=100`;
                const paramsAuthInfo = `auth/accounts/${address}`;
                const paramsSpendableBalances = `cosmos/bank/v1beta1/spendable_balances/${address}?pagination.limit=100`;

                let accountInfo = this.adapter.findOne({
                    address,
                });

                let balanceData, delegatedData, unbondingData, redelegationsData, authInfoData, spendableBalances;
                if (accountInfo) {
                    switch (message) {
                        case MSG_TYPE.MSG_DELEGATE:
                            [
                                balanceData,
                                delegatedData,
                                authInfoData,
                                spendableBalances
                            ] = await Promise.all([
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsBalance),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsDelegated),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsAuthInfo),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsSpendableBalances),
                            ]);

                            authInfo = authInfoData;

                            await Promise.all([
                                this.queryAllData(listBalances, balanceData, paramsBalance, CONST_CHAR.BALANCES),
                                this.queryAllData(listDelegates, delegatedData, paramsDelegated, CONST_CHAR.DELEGATION_RESPONSES),
                                this.queryAllData(listSpendableBalances, spendableBalances, paramsSpendableBalances, CONST_CHAR.BALANCES),
                            ])
                            break;
                        case MSG_TYPE.MSG_REDELEGATE:
                            [
                                balanceData,
                                delegatedData,
                                redelegationsData,
                                authInfoData,
                                spendableBalances
                            ] = await Promise.all([
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsBalance),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsDelegated),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsRedelegations),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsAuthInfo),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsSpendableBalances),
                            ]);

                            authInfo = authInfoData;

                            await Promise.all([
                                this.queryAllData(listBalances, balanceData, paramsBalance, CONST_CHAR.BALANCES),
                                this.queryAllData(listDelegates, delegatedData, paramsDelegated, CONST_CHAR.DELEGATION_RESPONSES),
                                this.queryAllData(listRedelegates, redelegationsData, paramsRedelegations, CONST_CHAR.REDELEGATION_RESPONSES),
                                this.queryAllData(listSpendableBalances, spendableBalances, paramsSpendableBalances, CONST_CHAR.BALANCES),
                            ])
                            break;
                        case MSG_TYPE.MSG_UNDELEGATE:
                            [
                                balanceData,
                                delegatedData,
                                unbondingData,
                                authInfoData,
                                spendableBalances
                            ] = await Promise.all([
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsBalance),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsDelegated),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsUnbonding),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsAuthInfo),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsSpendableBalances),
                            ]);

                            authInfo = authInfoData;

                            await Promise.all([
                                this.queryAllData(listBalances, balanceData, paramsBalance, CONST_CHAR.BALANCES),
                                this.queryAllData(listDelegates, delegatedData, paramsDelegated, CONST_CHAR.DELEGATION_RESPONSES),
                                this.queryAllData(listUnbonds, unbondingData, paramsUnbonding, CONST_CHAR.UNBONDING_RESPONSES),
                                this.queryAllData(listSpendableBalances, spendableBalances, paramsSpendableBalances, CONST_CHAR.BALANCES),
                            ])
                            break;
                        default:
                            [
                                balanceData,
                                authInfoData,
                                spendableBalances
                            ] = await Promise.all([
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsBalance),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsAuthInfo),
                                this.callApi(URL_TYPE_CONSTANTS.LCD, paramsSpendableBalances),
                            ]);

                            authInfo = authInfoData;

                            await Promise.all([
                                this.queryAllData(listBalances, balanceData, paramsBalance, CONST_CHAR.BALANCES),
                                this.queryAllData(listSpendableBalances, spendableBalances, paramsSpendableBalances, CONST_CHAR.BALANCES),
                            ])
                            break;
                    }
                } else {
                    [
                        balanceData,
                        delegatedData,
                        unbondingData,
                        redelegationsData,
                        authInfoData,
                        spendableBalances
                    ] = await Promise.all([
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsBalance),
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsDelegated),
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsUnbonding),
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsRedelegations),
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsAuthInfo),
                        this.callApi(URL_TYPE_CONSTANTS.LCD, paramsSpendableBalances),
                    ]);

                    accountInfo.address = address;
                    authInfo = authInfoData;

                    await Promise.all([
                        this.queryAllData(listBalances, balanceData, paramsBalance, CONST_CHAR.BALANCES),
                        this.queryAllData(listDelegates, delegatedData, paramsDelegated, CONST_CHAR.DELEGATION_RESPONSES),
                        this.queryAllData(listUnbonds, unbondingData, paramsUnbonding, CONST_CHAR.UNBONDING_RESPONSES),
                        this.queryAllData(listRedelegates, redelegationsData, paramsRedelegations, CONST_CHAR.REDELEGATION_RESPONSES),
                        this.queryAllData(listSpendableBalances, spendableBalances, paramsSpendableBalances, CONST_CHAR.BALANCES),
                    ])
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
            })
        }
        try {
            let res = await this.adapter.updateMany({}, listAccounts);
            this.logger.debug(res);
        } catch (error) {
            this.logger.error(error);
        }
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