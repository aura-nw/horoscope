import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { ObjectID } from 'bson';
import { Job } from 'bull';
import { FEEGRANT_ACTION, FEEGRANT_STATUS } from '../../common/constant';
import { FeegrantEntity } from 'entities';
import { Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { QueueConfig } from '../../config/queue';
import _ from 'lodash';
import { QueryOptions } from 'moleculer-db';
const QueueService = require('moleculer-bull');

export default class CronjobUpdateOriginalGrant extends Service {
    private dbFeegrantHistoryMixin = dbFeegrantHistoryMixin;
    public constructor(broker: ServiceBroker) {

        super(broker);
        this.parseServiceSchema({
            name: 'cronjob-update-original-grant',
            version: 1,
            mixins: [
                QueueService(QueueConfig.redis, QueueConfig.opts),
                this.dbFeegrantHistoryMixin,
            ],
            queues: {
                'cronjob.update-origin-grant': {
                    concurrency: 1,
                    async process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        await this.handleJob();
                        job.progress(100);
                        return true;
                    },
                },
            },
        });
    }
    async handleJob() {
        // find all records which were unprocessed
        const listUnprocess = await this.adapter.find({
            query: {
                "origin_feegrant_txhash": null
            }
        }) as FeegrantEntity[]
        if (listUnprocess.length > 0) {
            // list bulk action to update feegrant history db
            const bulkUpdate: any[] = []
            // get distict pairs (granter, grantee) in listUnprocess
            const distinctPairGranterGrantee = _.uniqBy(listUnprocess, function (elem) { return [elem.granter, elem.grantee].join() }).map(e => { return _.pick(e, ['granter', 'grantee']) })
            // construct query
            const query: QueryOptions = {}
            const queryOr: any[] = []
            distinctPairGranterGrantee.forEach(e => {
                queryOr.push({
                    'granter': e.granter,
                    'grantee': e.grantee
                })
            })
            query["$or"] = queryOr
            query["status"] = FEEGRANT_STATUS.AVAILABLE
            query["result"] = true
            // find grant for each distinctPairGranterGrantee
            const listOriginalFeegrant = await this.broker.call('v1.db-feegrant.find', {
                query
            }) as FeegrantEntity[]
            // list to update feegrant DB
            const listUpdateFeegrantDb: FeegrantEntity[] = []
            // find origin_feegrant_txhash for each unprocessed action
            // construct bulk update origin_feegrant_txhash for each unprocess action
            listUnprocess.forEach(e => {
                // e 's original feegrant
                // each unprocessed action: find original by looking up feegrant which has timestamp is max of all less than or equal its timestamp
                const suspiciousFeegrants = listOriginalFeegrant.filter(x => x.grantee === e.grantee && x.granter === e.granter && x.timestamp.getTime() < e.timestamp.getTime())
                if (suspiciousFeegrants.length > 0) {
                    const originalFeegrant = suspiciousFeegrants.reduce((prev, current) => {
                        return prev.timestamp.getTime() > current.timestamp.getTime() ? prev : current
                    })
                    e.origin_feegrant_txhash = originalFeegrant.tx_hash
                    listUpdateFeegrantDb.push(e)
                    bulkUpdate.push({
                        updateOne: {
                            filter: { _id: e._id },
                            update: {
                                $set: {
                                    'origin_feegrant_txhash': originalFeegrant.tx_hash,
                                },
                            },
                        },
                    })
                }
            })
            // forward all unprocessed actions to feegrant db service
            this.createJob(
                'feegrant.db',
                {
                    listUpdateFeegrantDb
                },
                {
                    removeOnComplete: true,
                    removeOnFail: {
                        count: 10,
                    },
                },
            );
            await this.adapter.bulkWrite(bulkUpdate)
        }
    }

    async _start() {
        if (process.env["NODE_ENV"] != "test") {
            this.createJob(
                'cronjob.update-origin-grant',
                {},
                {
                    removeOnComplete: true,
                    removeOnFail: {
                        count: 10,
                    },
                    repeat: {
                        every: parseInt(Config.MILISECOND_PER_BATCH, 10),
                    },
                },
            );
        }

        this.getQueue('cronjob.update-origin-grant').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
        });
        this.getQueue('cronjob.update-origin-grant').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
        });
        this.getQueue('cronjob.update-origin-grant').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
        });

        return super._start();
    }
}
