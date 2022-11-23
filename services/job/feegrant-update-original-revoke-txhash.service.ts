import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { ITransaction } from '../../entities';
import { IVote } from 'entities/vote.entity';
import { FEEGRANT_STATUS } from 'common/constant';
const QueueService = require('moleculer-bull');

export default class UpdateOriginalRevoke extends Service {
    private redisMixin = new RedisMixin().start();
    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'feegrant-update-update-original-revoke-txhash',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                ),
                dbFeegrantMixin,
                this.redisMixin,
            ],
            queues: {
                'update.original.revoke': {
                    concurrency: 1,
                    process(job: Job) {
                        job.progress(10);

                        // @ts-ignore
                        this.handleJob();
                        job.progress(100);
                        return true;
                    },
                },
            },
        });
    }

    async handleJob() {
        const listTxRevoke = await this.broker.call('v1.feegrantHistoryDb.find', {
            query: {
                "status": FEEGRANT_STATUS.REVOKED,
                "result": true
            },
            fields: [
                "tx_hash",
                "origin_feegrant_txhash"
            ]
        }) as []
        this.logger.info(JSON.stringify(listTxRevoke))
        const bulkUpdate = [] as any[]
        listTxRevoke.forEach(e => {
            bulkUpdate.push({
                updateOne: {
                    filter: {
                        origin_feegrant_txhash: e["origin_feegrant_txhash"]
                    },
                    update: {
                        $set: {
                            'origin_revoke_txhash': e["tx_hash"]
                        },
                    },
                },
            })
        })
        this.logger.info(JSON.stringify(bulkUpdate))
        await this.adapter.bulkWrite(bulkUpdate)
    }

    async _start() {
        this.createJob(
            'update.original.revoke',
            {},
            {
                removeOnComplete: true,
            },
        );
        this.getQueue('update.original.revoke').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
        });
        this.getQueue('update.original.revoke').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
        });
        this.getQueue('update.original.revoke').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
        });
        return super._start();
    }
}
