import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { dbAccountAuthMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { Config } from "../../common";
import { CONST_CHAR, URL_TYPE_CONSTANTS } from "../../common/constant";
import { JsonConvert, OperationMode } from "json2typescript";
import { Service, ServiceBroker } from "moleculer";
import { AccountAuthEntity } from "../../entities/account-auth.entity";
import { Utils } from "utils/utils";
const QueueService = require('moleculer-bull');

export default class CrawlAccountAuthInfoService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbAccountAuthMixin = dbAccountAuthMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'crawlAccountAuthInfo',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'crawl.account-auth-info',
                    },
                ),
                // this.redisMixin,
                this.dbAccountAuthMixin,
                this.callApiMixin,
            ],
            queues: {
                'account-auth-info': {
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
                        this.logger.debug(`Crawl account auth info`);
                        this.createJob(
                            'account-auth-info',
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
                const param =
                    Config.GET_PARAMS_AUTH_INFO + `/${address}`;
                const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

                let accountInfo: AccountAuthEntity = await this.adapter.findOne({
                    address,
                });
                if (!accountInfo) {
                    accountInfo = {} as AccountAuthEntity;
                    accountInfo.address = address;
                }

                let resultCallApi = await this.callApiFromDomain(url, param);

                accountInfo.account = resultCallApi;

                listAccounts.push(accountInfo);
            };
        }
        try {
            listAccounts.forEach((element) => {
                if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, element));
                else {
                    const item: AccountAuthEntity = new JsonConvert().deserializeObject(element, AccountAuthEntity);
                    listUpdateQueries.push(this.adapter.insert(item));
                }
            });
            await Promise.all(listUpdateQueries);
        } catch (error) {
            this.logger.error(error);
        }
    }

    async _start() {
        this.getQueue('crawl.account-auth-info').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('crawl.account-auth-info').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('crawl.account-auth-info').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}