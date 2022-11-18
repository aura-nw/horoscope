/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { QueueConfig } from '../../config/queue';
import { FeegrantEntity } from 'entities/feegrant.entity';
import _ from 'lodash';
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

interface UpdateContent {
    amount: number,
    status: FEEGRANT_STATUS
}
export default class FeegrantDB extends Service {
    private callApiMixin = new CallApiMixin().start();
    private dbFeegrantMixin = dbFeegrantMixin;

    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'feegrantDb',
            version: 1,
            mixins: [
                QueueService(QueueConfig.redis, QueueConfig.opts),
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
                'feegrant-check-expire.db': {
                    concurrency: 1,
                    async process(job: Job) {
                        job.progress(10);

                        // @ts-ignore
                        await this.handleJobCheckExpire();

                        job.progress(100);
                        return true;
                    },
                },
            }
        });
    }

    async handleJobCheckExpire() {
        // check expired
        await this.adapter.updateMany({
            'expiration': {
                $lte: new Date()
            },
            'status': FEEGRANT_STATUS.AVAILABLE
        },
            {
                $set: {
                    'expired': true
                }
            }
        )
    }

    async handleJob(listUpdateFeegrantDb: FeegrantEntity[]): Promise<any[]> {
        // process unprocess actions: use, revoke, use up
        const mapUpdate = new Map<String | null, UpdateContent>()
        // initialize map
        for (const e of listUpdateFeegrantDb) {
            if (e.action === FEEGRANT_ACTION.USE || e.action === FEEGRANT_ACTION.REVOKE) {
                //@ts-ignore
                mapUpdate.set(e.origin_feegrant_txhash, { amount: 0, status: FEEGRANT_STATUS.AVAILABLE })
            }
        }
        // update map
        for (const e of listUpdateFeegrantDb) {
            // for each new used record received, update spendable
            if (e.action == FEEGRANT_ACTION.USE) {
                //@ts-ignore
                const tmp_amount = mapUpdate.get(e.origin_feegrant_txhash)?.amount + parseInt(e.amount.amount.toString())
                const tmp_status = mapUpdate.get(e.origin_feegrant_txhash)?.status

                mapUpdate.set(e.origin_feegrant_txhash, {
                    amount: tmp_amount,
                    //@ts-ignore
                    status: tmp_status
                })
            } else if (e.action == FEEGRANT_ACTION.REVOKE) {
                if (e.status == FEEGRANT_STATUS.USE_UP) {
                    // for each new used up record received, update status to use up
                    const tmp_amount = mapUpdate.get(e.origin_feegrant_txhash)?.amount
                    const tmp_status = FEEGRANT_STATUS.USE_UP

                    mapUpdate.set(e.origin_feegrant_txhash, {
                        //@ts-ignore
                        amount: tmp_amount,
                        status: tmp_status
                    })
                } else {
                    // for each new revoked record received, update status to revoked
                    const tmp_amount = mapUpdate.get(e.origin_feegrant_txhash)?.amount
                    const tmp_status = FEEGRANT_STATUS.REVOKED

                    mapUpdate.set(e.origin_feegrant_txhash, {
                        //@ts-ignore
                        amount: tmp_amount,
                        status: tmp_status
                    })
                }
            }
        }
        const bulkUpdate = [] as any[]
        const listOriginalRecords = await this.adapter.lean({
            query: {
                "tx_hash": {
                    $in: Array.from(mapUpdate.keys())
                }
            },
            projection: {
                "tx_hash": 1,
                amount: 1,
            }
        }) as FeegrantEntity[]
        listOriginalRecords.forEach(e => [
            bulkUpdate.push({
                updateOne: {
                    filter: { tx_hash: e.tx_hash },
                    update: {
                        $set: {
                            //@ts-ignore
                            'amount.amount': e.amount.amount ? parseInt(e.amount.amount.toString()) - mapUpdate.get(e.tx_hash)?.amount : null,
                            'status': mapUpdate.get(e.tx_hash)?.status,
                        },
                    },
                },
            })
        ])
        this.adapter.bulkWrite(bulkUpdate)
        return []
    }


    async _start() {
        if (process.env["NODE_ENV"] != "test") {
            this.createJob(
                'feegrant-check-expire.db',
                {},
                {
                    removeOnComplete: true,
                    removeOnFail: {
                        count: 10,
                    },
                    repeat: {
                        every: parseInt(Config.MILISECOND_CHECK_EXPIRE, 10),
                    },
                },
            );
        }
        this.getQueue('feegrant.db').on('completed', (job: Job) => {
            this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('feegrant.db').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('feegrant.db').on('progress', (job: Job) => {
            this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
        });
        this.getQueue('feegrant-check-expire.db').on('completed', (job: Job) => {
            this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('feegrant-check-expire.db').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('feegrant-check-expire.db').on('progress', (job: Job) => {
            this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}
