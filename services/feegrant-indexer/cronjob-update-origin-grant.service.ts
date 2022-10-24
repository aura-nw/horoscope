import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { ObjectID } from 'bson';
import { Job } from 'bull';
import { FEEGRANT_ACTION } from '../../common/constant';
import { FeegrantEntity } from 'entities';
import { Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class HandleAccountVestingService extends Service {
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
        const listUpdate = await this.adapter.find({
            query: {
                "origin_feegrant_txhash": null
            }
        }) as FeegrantEntity[]
        // list bulk action to update feegrant history db
        const bulkUpdate: any[] = []
        // list to update feegrant DB
        const listUpdateFeegrantDb: FeegrantEntity[] = []
        // update origin_feegrant_txhash for all unprocessed records 
        await Promise.all(listUpdate.map(async e => {
            const originalCreate = await this.adapter.find({
                query: {
                    "granter": e.granter,
                    "grantee": e.grantee,
                    "action": FEEGRANT_ACTION.CREATE,
                    "timestamp": {
                        $lte: e.timestamp
                    }
                },
                sort: "-timestamp",
                limit: 1
            }) as FeegrantEntity[]
            if (originalCreate.length > 0) {
                this.logger.info(`${e._id}  ${originalCreate[0].type}   ${originalCreate[0].tx_hash}`)
                e.origin_feegrant_txhash = originalCreate[0].tx_hash
                listUpdateFeegrantDb.push(e)
                bulkUpdate.push({
                    updateOne: {
                        filter: { _id: e._id },
                        update: {
                            $set: {
                                'type': originalCreate[0].type,
                                'origin_feegrant_txhash': originalCreate[0].tx_hash,
                            },
                        },
                    },
                })
            }
        }))
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
        this.logger.info(`${JSON.stringify(bulkUpdate)}`)
        this.logger.info(`listUpdateFeegrantDb: ${JSON.stringify(listUpdateFeegrantDb)}`)
        await this.adapter.bulkWrite(bulkUpdate)
    }

    async _start() {
        this.createJob(
            'cronjob.update-origin-grant',
            {},
            {
                removeOnComplete: true,
                removeOnFail: {
                    count: 10,
                },
                repeat: {
                    every: parseInt(Config.MILISECOND_CRONJOB_UPDATE_ORIGIN_GRANT, 10),
                },
            },
        );

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
