import CallApiMixin from "../../mixins/callApi/call-api.mixin";
import { dbAccountSpendableBalancesMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { Config } from "../../common";
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from "../../common/constant";
import { JsonConvert } from "json2typescript";
import { Service, ServiceBroker } from "moleculer";
import { AccountSpendableBalancesEntity } from "../../entities/account-spendable-balances.entity";
import { Utils } from "../../utils/utils";
const QueueService = require('moleculer-bull');

export default class CrawlAccountSpendableBalancesService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbAccountSpendableBalancesMixin = dbAccountSpendableBalancesMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'crawlAccountSpendableBalances',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'crawl.account-spendable-balances',
                    },
                ),
                // this.redisMixin,
                this.dbAccountSpendableBalancesMixin,
                this.callApiMixin,
            ],
            queues: {
                'account-spendable-balances': {
                    concurrency: 1,
                    async process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        await this.handleJob(job.data.listAddresses, job.data.chainId);
                        job.progress(100);
                        return true;
                    },
                }
            },
            events: {
                'account-info.upsert-each': {
                    handler: (ctx: any) => {
                        this.logger.debug(`Crawl account spendable balances`);
                        this.createJob(
                            'account-spendable-balances',
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

    async handleJob(listAddresses: any[], chainId: string) {
        let listAccounts: any[] = [], listUpdateQueries: any[] = [];
        if (listAddresses.length > 0) {
            for (const address of listAddresses) {
                let listSpendableBalances: any[] = [];

                const param =
                    Config.GET_PARAMS_SPENDABLE_BALANCE + `/${address}?pagination.limit=100`;
                const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);

                let accountInfo: AccountSpendableBalancesEntity = await this.adapter.findOne({
                    address,
                    'custom_info.chain_id': chainId,
                });
                if (!accountInfo) {
                    accountInfo = {} as AccountSpendableBalancesEntity;
                }

                let urlToCall = param;
                let done = false;
                let resultCallApi;
                while (!done) {
                    resultCallApi = await this.callApiFromDomain(url, param);

                    listSpendableBalances.push(...resultCallApi.balances);
                    if (resultCallApi.pagination.next_key === null) {
                        done = true;
                    } else {
                        urlToCall = `${param}&pagination.key=${resultCallApi.pagination.next_key}`;
                    }
                }

                if (listSpendableBalances) {
                    accountInfo.spendable_balances = listSpendableBalances;
                    accountInfo.address = address;
                }

                listAccounts.push(accountInfo);
            };
        }
        try {
            listAccounts.forEach((element) => {
                if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, element));
                else {
                    const chain = LIST_NETWORK.find(x => x.chainId === chainId);
                    element.custom_info = {
                        chain_id: chainId,
                        chain_name: chain ? chain.chainName : '',
                    };
                    const item: any = new JsonConvert().deserializeObject(element, AccountSpendableBalancesEntity);
                    listUpdateQueries.push(this.adapter.insert(item));
                }
            });
            await Promise.all(listUpdateQueries);
        } catch (error) {
            this.logger.error(error);
        }
    }

    async _start() {
        this.getQueue('crawl.account-spendable-balances').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('crawl.account-spendable-balances').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('crawl.account-spendable-balances').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}