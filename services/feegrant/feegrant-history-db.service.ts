/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { FeegrantEntity } from 'entities';
import _ from 'lodash';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { JsonConvert, OperationMode } from 'json2typescript';
import { FEEGRANT_ACTION, FEEGRANT_STATUS, LIST_NETWORK } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { IFeegrantData } from './feegrant-tx-handler.service';
import { QueueConfig } from '../../config/queue';
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
            name: 'feegrantHistoryDb',
            version: 1,
            mixins: [
                QueueService(QueueConfig.redis, QueueConfig.opts),
                this.dbFeegrantHistoryMixin,
                this.callApiMixin,
            ],
            queues: {
                'feegrant.history-db': {
                    concurrency: 1,
                    process(job: Job) {
                        job.progress(10);

                        // @ts-ignore
                        this.handleJob(job.data.feegrantList, job.data.chainId);

                        job.progress(100);
                        return true;
                    },
                },
            }
        });
    }

    async handleJob(feegrantList: IFeegrantData[], chainId: string): Promise<any[]> {
        // list history feegrant action
        const records: any[] = []
        const records_create: any[] = []
        feegrantList.forEach(async (element) => {
            switch (element.action) {
                case FEEGRANT_ACTION.CREATE:
                    // normal create
                    {
                        let record = {
                            ...element,
                            status: element.result ? FEEGRANT_STATUS.AVAILABLE : FEEGRANT_STATUS.FAIL,
                            _id: null,
                            action: FEEGRANT_ACTION.CREATE,
                            origin_feegrant_txhash: element.tx_hash,
                        } as FeegrantEntity
                        record.amount = element.spend_limit
                        records.push(record)
                        records_create.push(record)
                        break;
                    }
                case FEEGRANT_ACTION.USE:
                    // normal use feegrant
                    {
                        const record = {
                            ...element,
                            status: FEEGRANT_STATUS.AVAILABLE,
                            _id: null,
                            action: FEEGRANT_ACTION.USE,
                            origin_feegrant_txhash: null,
                        } as FeegrantEntity
                        record.granter = element.payer
                        records.push(record)
                        break
                    }
                case FEEGRANT_ACTION.USE_UP:
                    // useup feegrant
                    {
                        // record use
                        const record_use = {
                            ...element,
                            status: FEEGRANT_STATUS.USE_UP,
                            _id: null,
                            action: FEEGRANT_ACTION.USE,
                            origin_feegrant_txhash: null,
                        } as FeegrantEntity
                        record_use.granter = element.payer
                        record_use.type = ""
                        records.push(record_use)
                        // record revoke
                        const record_revoke = {
                            ...element,
                            status: FEEGRANT_STATUS.USE_UP,
                            _id: null,
                            action: FEEGRANT_ACTION.REVOKE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        record_revoke.granter = element.payer
                        record_revoke.type = ""
                        records.push(record_revoke)
                        break
                    }
                case FEEGRANT_ACTION.REVOKE:
                    // normal revoke feegrant
                    {
                        // record revoke
                        const record = {
                            ...element,
                            status: FEEGRANT_STATUS.REVOKED,
                            _id: null,
                            action: FEEGRANT_ACTION.REVOKE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        records.push(record)
                        break
                    }
                case FEEGRANT_ACTION.REVOKE_WITH_FEEGRANT:
                    // revoke use feegrant from another
                    {
                        // record revoke
                        const record_revoke = {
                            ...element,
                            status: FEEGRANT_STATUS.REVOKED,
                            _id: null,
                            action: FEEGRANT_ACTION.REVOKE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        records.push(record_revoke)
                        // record payfee
                        const record_payfee = {
                            ...element,
                            status: FEEGRANT_STATUS.AVAILABLE,
                            _id: null,
                            action: FEEGRANT_ACTION.USE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        record_payfee.type = ""
                        record_payfee.grantee = element.granter
                        record_payfee.granter = element.payer
                        records.push(record_payfee)
                        break;
                    }
                case FEEGRANT_ACTION.CREATE_WITH_FEEGRANT:
                    // create use feegrant from another
                    {
                        // record create
                        const record_create = {
                            ...element,
                            status: element.result ? FEEGRANT_STATUS.AVAILABLE : FEEGRANT_STATUS.FAIL,
                            _id: null,
                            action: FEEGRANT_ACTION.CREATE,
                            origin_feegrant_txhash: element.tx_hash
                        } as FeegrantEntity
                        record_create.amount = element.spend_limit
                        records.push(record_create)
                        records_create.push(record_create)
                        // record pay fee
                        const record_payfee = {
                            ...element,
                            status: FEEGRANT_STATUS.AVAILABLE,
                            _id: null,
                            action: FEEGRANT_ACTION.USE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        record_payfee.result = true
                        record_payfee.type = ""
                        record_payfee.grantee = element.granter
                        record_payfee.granter = element.payer
                        records.push(record_payfee)
                        break;
                    }
            }
        });
        // insert new grants to feegrant DB
        try {
            await this.broker.call('v1.feegrantDb.insert', {
                entities: records_create
            })
        } catch (error) {
            this.logger.error(error)
        }
        // save to history feegrant DB
        try {
            await this.adapter.insertMany(records)
        } catch (error) {
            this.logger.error(error)
        }
        return []
    }


    async _start() {
        this.getQueue('feegrant.history-db').on('completed', (job: Job) => {
            this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
        });
        this.getQueue('feegrant.history-db').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
        });
        this.getQueue('feegrant.history-db').on('progress', (job: Job) => {
            this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
        });
        return super._start();
    }
}
