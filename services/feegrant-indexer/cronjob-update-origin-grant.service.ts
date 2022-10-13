import { dbFeegrantHistoryMixin } from '@Mixins/dbMixinMongoose';
import { Job } from 'bull';
import { FEEGRANT_ACTION } from 'common/constant';
import { FeegrantEntity } from 'entities';
import { Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
const QueueService = require('moleculer-bull');

export default class HandleAccountVestingService extends Service {
    private dbFeegrantHistoryMixin = dbFeegrantHistoryMixin;
    public constructor(broker: ServiceBroker) {

        super(broker);
        this.parseServiceSchema({
            name: 'cronjob-update-original-grant',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'cronjob.update-origin-grant',
                    },
                ),
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
        const listUpdate = await this.adapter.find({
            query: {
                "origin_feegrant_txhash": null
            }
        }) as FeegrantEntity[]
        const bulkUpdate: any[] = []
        listUpdate.forEach(async e => {
            const originalCreate = await this.adapter.find({
                query: {
                    "granter": e.granter,
                    "grantee": e.grantee,
                    "action": FEEGRANT_ACTION.CREATE,
                    "timestamp": {
                        $lt: e.timestamp
                    }
                },
                sort: "-timestamp",
                limit: 1
            }) as FeegrantEntity[]
            this.logger.info(JSON.stringify(originalCreate[0]))
            // bulkUpdate.push({
            //     updateOne: {
            //         filter: { _id: e._id },
            //         update: {
            //             $set: {
            //                 'type': originalCreate[0].type,
            //                 'origin_feegrant_txhash': originalCreate[0].origin_feegrant_txhash,
            //             },
            //         },
            //     },
            // })

        })
        // this.adapter.bulkWrite(bulkUpdate)
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
