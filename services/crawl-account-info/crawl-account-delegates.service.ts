import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { dbAccountDelegationsMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { Config } from "../../common";
import { CONST_CHAR, MSG_TYPE, URL_TYPE_CONSTANTS } from "../../common/constant";
import { JsonConvert } from "json2typescript";
import { Service, ServiceBroker } from "moleculer";
import { AccountDelegationsEntity } from "../../entities/account-delegations.entity";
import { Utils } from "utils/utils";
const QueueService = require('moleculer-bull');

export default class CrawlAccountDelegatesService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbAccountDelegationsMixin = dbAccountDelegationsMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'crawlAccountDelegates',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'crawl.account-delegates',
                    },
                ),
                // this.redisMixin,
                this.dbAccountDelegationsMixin,
                this.callApiMixin,
            ],
            queues: {
                'crawl.account-delegates': {
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
            events: {
                'account-info.upsert-each': {
                    handler: (ctx: any) => {
                        this.logger.debug(`Crawl account delegates`);
                        this.createJob(
                            'crawl.account-delegates',
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
                let listDelegates: any[] = [];

                const param =
                    Config.GET_PARAMS_DELEGATE + `/${address}?pagination.limit=100`;
                const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

                let accountInfo: AccountDelegationsEntity = await this.adapter.findOne({
                    address,
                });
                if (!accountInfo) {
                    accountInfo = {} as AccountDelegationsEntity;
                    accountInfo.address = address;
                }

                let urlToCall = param;
                let done = false;
                let resultCallApi;
                while (!done) {
                    resultCallApi = await this.callApiFromDomain(url, param);

                    listDelegates.push(...resultCallApi.delegation_responses);
                    if (resultCallApi.pagination.next_key === null) {
                        done = true;
                    } else {
                        urlToCall = `${param}&pagination.key=${resultCallApi.pagination.next_key}`;
                    }
                }

                if (listDelegates) {
                    accountInfo.delegation_responses = listDelegates;
                }

                listAccounts.push(accountInfo);
            };
        }
        try {
            listAccounts.forEach((element) => {
                if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, element));
                else {
                    const item: any = new JsonConvert().deserializeObject(element, AccountDelegationsEntity);
                    listUpdateQueries.push(this.adapter.insert(item));
                }
            });
            await Promise.all(listUpdateQueries);
        } catch (error) {
            this.logger.error(error);
        }
    }

    async _start() {
        this.getQueue('crawl.account-delegates').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('crawl.account-delegates').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('crawl.account-delegates').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}