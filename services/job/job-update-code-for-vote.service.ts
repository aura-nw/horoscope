import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { dbVoteMixin } from '../../mixins/dbMixinMongoose/db-vote.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { ITransaction } from '../../entities';
import { IVote } from 'entities/vote.entity';
const QueueService = require('moleculer-bull');

export default class InitVotingData extends Service {
    private redisMixin = new RedisMixin().start();
    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'job-update-code-for-vote',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                ),
                dbVoteMixin,
                this.redisMixin,
            ],
            queues: {
                'update.code.vote': {
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
        const unprocessedVotes = await this.adapter.lean({
            query: {
                "code": {
                    $exists: false
                }
            }
        }) as IVote[]
        const queryIn_txhash = unprocessedVotes.map(vote => vote["txhash"]) as string[]
        const listDataVote = await this.broker.call("v1.feegrantTxHandler.find", {
            query: {
                "tx_response.txhash": {
                    $in: queryIn_txhash
                }
            },
            fields: [
                "tx_response.txhash",
                "tx_response.code"
            ]
        }) as []
        const mapTxCode: Map<String, String> = new Map()
        listDataVote.forEach(e => {
            mapTxCode.set(e["tx_response"]["txhash"], e["tx_response"]["code"])
        })
        unprocessedVotes.forEach(vote => {
            //@ts-ignore
            vote["code"] = mapTxCode.get(vote["txhash"])
        })
        const queryIn_id = unprocessedVotes.map(vote => vote["_id"]) as string[]
        await this.adapter.removeMany({
            "_id": {
                $in: queryIn_id
            }
        })
        await this.adapter.insertMany(unprocessedVotes)
        this.logger.info([...mapTxCode.entries()])
    }

    async _start() {
        this.createJob(
            'update.code.vote',
            {
            },
            {
                removeOnComplete: true,
            },
        );
        this.getQueue('update.code.vote').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
        });
        this.getQueue('update.code.vote').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
        });
        this.getQueue('update.code.vote').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
        });
        return super._start();
    }
}
