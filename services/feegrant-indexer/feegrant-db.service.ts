/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { FeegrantEntity } from 'entities/feegrant.entity';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { FEEGRANT_ACTION, FEEGRANT_STATUS, LIST_NETWORK } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
import { IFeegrantData } from './feegrant-tx-handler.service';
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
            name: 'db-feegrant',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'feegrant.db',
                    },
                ),
                this.dbFeegrantMixin,
                this.callApiMixin,
            ],
            queues: {
                'feegrant.db': {
                    concurrency: 1,
                    process(job: Job) {
                        job.progress(10);

                        // @ts-ignore
                        this.handleJob(job.data.listUpdateFeegrantDb);

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
                                listUpdateFeegrantDb: ctx.params.listUpdateFeegrantDb,
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

    async handleJob(listUpdateFeegrantDb: FeegrantEntity[]): Promise<any[]> {
        await Promise.all(listUpdateFeegrantDb.map(async e => {
            if (e.action == FEEGRANT_ACTION.CREATE) {
                let record = {
                    ...e,
                } as FeegrantEntity
                this.logger.info(`Feegrant-create: ${record}`)
                await this.adapter.insert(record)
            }
        }))
        for (const e of listUpdateFeegrantDb) {
            if (e.action == FEEGRANT_ACTION.USE) {
                if (e.status == FEEGRANT_STATUS.USE_UP) {
                    const record = await this.adapter.find({
                        query: {
                            "tx_hash": e.origin_feegrant_txhash
                        },
                        limit: 1
                    }) as FeegrantEntity[]
                    if (record[0].spend_limit) {
                        this.adapter.updateById(record[0]._id, {
                            $set: {
                                "status": FEEGRANT_STATUS.USE_UP
                            },
                        });
                    }
                } else {
                    const record = await this.adapter.find({
                        query: {
                            "tx_hash": e.origin_feegrant_txhash
                        },
                        limit: 1
                    }) as FeegrantEntity[]
                    if (record[0].spend_limit) {
                        this.adapter.updateById(record[0]._id, {
                            $set: {
                                "amount.amount": (parseInt(record[0].amount.amount.toString()) - parseInt(e.amount.amount.toString())).toString(),
                                "timestamp": e.timestamp
                            },
                        });
                    }
                }
            } else if (e.action == FEEGRANT_ACTION.REVOKE) {
                const record = await this.adapter.find({
                    query: {
                        "tx_hash": e.origin_feegrant_txhash
                    },
                    limit: 1
                }) as FeegrantEntity[]
                if (record[0].spend_limit) {
                    this.adapter.updateById(record[0]._id, {
                        $set: {
                            "status": FEEGRANT_STATUS.REVOKED
                        },
                    });
                }
            }
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
