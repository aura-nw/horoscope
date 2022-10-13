/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { LIST_NETWORK } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { IFeegrantData } from './feegrant-tx-handler.service';
const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

export default class CrawlAccountInfoService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbFeegrantHistoryMixin = dbFeegrantHistoryMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'db-feegrant',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'feegrant.db',
                    },
                ),
                this.dbFeegrantHistoryMixin,
                this.callApiMixin,
            ],
            queues: {
                'feegrant.db': {
                    concurrency: 1,
                    process(job: Job) {
                        job.progress(10);

                        // @ts-ignore
                        this.handleJob(job.data.listTx, job.data.chainId);

                        job.progress(100);
                        return true;
                    },
                },
            },
            events: {
                'feegrant.upsert': {
                    handler: (ctx: any) => {
                        this.createJob(
                            'feegrant.db',
                            {
                                feegrantList: ctx.params.feegrantList,
                                chainId: ctx.params.chainId,
                            },
                            {
                                removeOnComplete: true,
                                removeOnFail: {
                                    count: 10,
                                },
                            },
                        );
                        return;
                    },
                },
            },
        });
    }

    async handleJob(feegrantList: IFeegrantData[], chainId: string): Promise<any[]> {
        chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
        const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
        const custom_info = {
            chain_id: chainId,
            chain_name: chain ? chain.chainName : '',
        }

        return []
    }


    async _start() {
        this.getQueue('feegrant.db').on('completed', (job: Job) => {
            this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('feegrant.db').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('feegrant.db').on('progress', (job: Job) => {
            this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}
