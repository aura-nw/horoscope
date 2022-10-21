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
            name: 'history-db-feegrant',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'feegrant.history-db',
                    },
                ),
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
            },
            events: {
                'feegrant.history.upsert': {
                    handler: (ctx: any) => {
                        this.createJob(
                            'feegrant.history-db',
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
        feegrantList.forEach(async (element) => {

            switch (element.action) {
                case FEEGRANT_ACTION.CREATE:
                    // normal create
                    {
                        let record = {
                            ...element,
                            status: FEEGRANT_STATUS.AVAILABLE,
                            _id: null,
                            action: FEEGRANT_ACTION.CREATE,
                            origin_feegrant_txhash: null,
                        } as FeegrantEntity
                        record.amount = element.spend_limit
                        this.logger.info(`Feegrant-history-create: ${record}`)
                        await this.adapter.insert(record)
                        break;
                    }
                case FEEGRANT_ACTION.USE:
                    // normal use feegrant
                    {
                        {
                            const record = {
                                ...element,
                                status: FEEGRANT_STATUS.AVAILABLE,
                                _id: null,
                                action: FEEGRANT_ACTION.USE,
                                origin_feegrant_txhash: null,
                            } as FeegrantEntity
                            record.granter = element.payer
                            this.logger.info(`Feegrant-history-use: ${JSON.stringify(record)}`)
                            await this.adapter.insert(record)
                        }
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
                        this.logger.info(`Feegrant-history-useup_use: ${JSON.stringify(record_use)}`)
                        await this.adapter.insert(record_use)
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
                        this.logger.info(`Feegrant-history-useup_revoke: ${JSON.stringify(record_revoke)}`)
                        await this.adapter.insert(record_revoke)
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
                        this.logger.info(`Feegrant-history-revoke: ${JSON.stringify(record)}`)
                        await this.adapter.insert(record)
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
                        this.logger.info(`Feegrant-history-_revoke: ${JSON.stringify(record_revoke)}`)
                        await this.adapter.insert(record_revoke)
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
                        await this.adapter.insert(record_payfee)
                        break;
                    }
                case FEEGRANT_ACTION.CREATE_WITH_FEEGRANT:
                    // create use feegrant from another
                    {
                        // record create
                        const record_create = {
                            ...element,
                            status: FEEGRANT_STATUS.AVAILABLE,
                            _id: null,
                            action: FEEGRANT_ACTION.CREATE,
                            origin_feegrant_txhash: null
                        } as FeegrantEntity
                        record_create.amount = element.spend_limit
                        await this.adapter.insert(record_create)

                        // record pay fee
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
                        await this.adapter.insert(record_payfee)
                        break;
                    }
            }
        });
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