import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { dbAccountBalancesMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { Config } from "../../common";
import { CONST_CHAR, MSG_TYPE, URL_TYPE_CONSTANTS } from "../../common/constant";
import { AccountInfoEntity } from "../../entities/account-info.entity";
import { JsonConvert } from "json2typescript";
import { Service, ServiceBroker } from "moleculer";
import { AccountBalancesEntity } from "../../entities/account-balances.entity";
const QueueService = require('moleculer-bull');

export default class CrawlAccountBalancesService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbAccountBalancesMixin = dbAccountBalancesMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'crawlAccountBalances',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'crawl.account-balances',
                    },
                ),
                // this.redisMixin,
                this.dbAccountBalancesMixin,
                this.callApiMixin,
            ],
            queues: {
                'crawl.account-balances': {
                    concurrency: 1,
                    async process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        await this.handleJob(job.data.listAddresses);
                        job.progress(100);
                        return true;
                    },
                }
            },
            // actions: {
            //     accountinfoupsert: {
            //         name: 'accountinfoupsert',
            //         rest: 'GET /account-info/:address',
            //         handler: async (ctx: any): Promise<any[]> => {
            //             this.logger.debug(`Crawl account info`);
            //             let result = await this.handleJob(ctx.params.listTx, ctx.params.source);
            //             return result;
            //         }
            //     }
            // },
            events: {
                'account-info.upsert-each': {
                    handler: (ctx: any) => {
                        this.logger.debug(`Crawl account balances`);
                        this.createJob(
                            'crawl.account-balances',
                            {
                                listAddresses: ctx.params.listAddresses,
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

    async handleJob(listAddresses: any[]) {
        let listAccounts: any[] = [], listUpdateQueries: any[] = [];
        if (listAddresses.length > 0) {
            for (const address of listAddresses) {
                let listBalances: any[] = [];

                const url =
                    Config.GET_PARAMS_BALANCE + `/${address}?pagination.limit=100`;

                let accountInfo: AccountBalancesEntity = await this.adapter.findOne({
                    address,
                });
                if (!accountInfo) {
                    accountInfo = {} as AccountBalancesEntity;
                    accountInfo.address = address;
                }

                let urlToCall = url;
                let done = false;
                let resultCallApi;
                while (!done) {
                    resultCallApi = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlToCall);

                    listBalances.push(...resultCallApi.balances);
                    if (resultCallApi.pagination.next_key === null) {
                        done = true;
                    } else {
                        urlToCall = `${url}&pagination.key=${resultCallApi.pagination.next_key}`;
                    }
                }

                if (listBalances) {
                    accountInfo.balances = listBalances;
                }

                listAccounts.push(accountInfo);
            };
        }
        try {
            listAccounts.forEach((element) => {
                if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, element));
                else {
                    const item: any = new JsonConvert().deserializeObject(element, AccountBalancesEntity);
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
        return super._start();
    }
}