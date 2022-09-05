import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { dbAccountAuthMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { Config } from "../../common";
import { CONST_CHAR, LIST_NETWORK, URL_TYPE_CONSTANTS, VESTING_ACCOUNT_TYPE } from "../../common/constant";
import { JsonConvert, OperationMode } from "json2typescript";
import { Context, Service, ServiceBroker } from "moleculer";
import { AccountAuthEntity } from "../../entities/account-auth.entity";
import { Utils } from "../../utils/utils";
import { CrawlAccountInfoParams } from "../../types";
const QueueService = require('moleculer-bull');
const Bull = require('bull');

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
                'crawl.account-auth-info': {
                    concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_AUTH, 10),
                    process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        this.handleJob(job.data.listAddresses, job.data.chainId);
                        job.progress(100);
                        return true;
                    },
                }
            },
            events: {
                'account-info.upsert-each': {
                    handler: (ctx: Context<CrawlAccountInfoParams>) => {
                        this.logger.debug(`Crawl account auth info`);
                        this.createJob(
                            'crawl.account-auth-info',
                            {
                                listAddresses: ctx.params.listAddresses,
                                chainId: ctx.params.chainId,
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

    async handleJob(listAddresses: string[], chainId: string) {
        let listAccounts: AccountAuthEntity[] = [], listUpdateQueries: any[] = [];
        if (listAddresses.length > 0) {
            for (let address of listAddresses) {
                const param =
                    Config.GET_PARAMS_AUTH_INFO + `/${address}`;
                const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

                let accountInfo: AccountAuthEntity = await this.adapter.findOne({
                    address,
                    'custom_info.chain_id': chainId,
                });
                if (!accountInfo) {
                    accountInfo = {} as AccountAuthEntity;
                    accountInfo.address = address;
                }

                let resultCallApi = await this.callApiFromDomain(url, param);
                try {
                    if (resultCallApi.result.type === VESTING_ACCOUNT_TYPE.CONTINUOUS
                        || resultCallApi.result.type === VESTING_ACCOUNT_TYPE.DELAYED
                        || resultCallApi.result.type === VESTING_ACCOUNT_TYPE.PERIODIC) {
                        let delay = resultCallApi.result.value.base_vesting_account.end_time - new Date().getTime();
                        const apiKeyQueue = new Bull(
                            'handle.address',
                            {
                                redis: {
                                    host: Config.REDIS_HOST,
                                    port: Config.REDIS_PORT,
                                    username: Config.REDIS_USERNAME,
                                    password: Config.REDIS_PASSWORD,
                                    db: Config.REDIS_DB_NUMBER,
                                },
                                prefix: 'handle.address',
                                defaultJobOptions: {
                                    jobId: `${address}_${chainId}_${resultCallApi.result.value.base_vesting_account.end_time}`,
                                    removeOnComplete: true,
                                    delay,
                                }
                            }
                        );
                        apiKeyQueue.add({
                            listTx: [
                                {
                                    address,
                                }
                            ],
                            source: CONST_CHAR.API,
                            chainId,
                        });
                    }
                } catch (error) {
                    this.logger.info(`This account is not a vesting account`);
                }

                accountInfo.account = resultCallApi;

                listAccounts.push(accountInfo);
            };
        }
        try {
            listAccounts.map((element) => {
                if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, element));
                else {
                    const chain = LIST_NETWORK.find(x => x.chainId === chainId);
                    const item: AccountAuthEntity = new JsonConvert().deserializeObject(element, AccountAuthEntity);
                    item.custom_info = {
                        chain_id: chainId,
                        chain_name: chain ? chain.chainName : '',
                    };
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