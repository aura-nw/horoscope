/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { ITransaction } from 'entities';
import * as _ from 'lodash';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
import { Utils } from '../../utils/utils';
const QueueService = require('moleculer-bull');
const CONTRACT_URI = Config.CONTRACT_URI;
const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

export default class CrawlAccountInfoService extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbFeegrantMixin = dbFeegrantMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'update-db-feegrant',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'feegrant.update-db',
                    },
                ),
                this.dbFeegrantMixin,
                this.callApiMixin,
            ],
            queues: {
                'feegrant.update-db': {
                    concurrency: parseInt(Config.CONCURRENCY_FEEGRANT_TX_HANDLER, 10),
                    process(job: Job) {
                        job.progress(10);
                        const URL = Utils.getUrlByChainIdAndType(
                            job.data.chainId,
                            URL_TYPE_CONSTANTS.LCD,
                        );

                        // @ts-ignore
                        this.handleJob(URL, job.data.listTx, job.data.chainId);

                        job.progress(100);
                        return true;
                    },
                },
            },
            events: {
                'feegrant.upsert': {
                    handler: (ctx: any) => {
                        this.createJob(
                            'feegrant.update-db',
                            {
                                listTx: ctx.params.listTx,
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

    async handleJob(URL: string, listTx: ITransaction[], chainId: string): Promise<any[]> {
        return []
    }


    async _start() {
        this.getQueue('feegrant.update-db').on('completed', (job: Job) => {
            this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('feegrant.update-db').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('feegrant.update-db').on('progress', (job: Job) => {
            this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}
