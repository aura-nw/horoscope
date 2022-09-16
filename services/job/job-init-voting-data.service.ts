import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { dbTransactionMixin } from '@Mixins/dbMixinMongoose';
import RedisMixin from '@Mixins/redis/redis.mixin';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { ITransaction } from 'entities';
const QueueService = require('moleculer-bull');

export default class InitVotingData extends Service {
	private redisMixin = new RedisMixin().start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'job-init-voting-data',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
				),
				dbTransactionMixin,
				this.redisMixin,
			],
			queues: {
				'init.voting.data': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);

						// @ts-ignore
						this.handleJob(job.data.lastId, job.data.currentSmallestVoteId);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(lastTxId: string, currentSmallestVoteId?: string) {
		const smallestVoteId =
			currentSmallestVoteId ||
			(await this.broker.call('v1.proposal-vote-manager.act-find-smallest-id'));

		if (smallestVoteId && lastTxId > smallestVoteId) return true;
		const query =
			lastTxId === '0'
				? { _id: { $lt: new ObjectId(smallestVoteId) } }
				: { _id: { $gt: new ObjectId(lastTxId), $lt: new ObjectId(smallestVoteId) } };
		const listTx: ITransaction[] = await this.adapter.find({
			query,
			sort: '_id',
			limit: 100,
			skip: 0,
		});

		if (listTx.length > 0) {
			const lastId = listTx.at(-1)?._id;
			this.redisClient.set(Config.REDIS_KEY_VOTE_LAST_TX_ID, lastId?.toString());
			this.createJob('init.voting.data', { lastId }, { removeOnComplete: true });
			await this.broker.call('v1.vote-handler.act-take-vote', { listTx });
		}
		return true;
	}

	async _start() {
		this.redisClient = await this.getRedisClient();
		let lastId = (await this.redisClient.get(Config.REDIS_KEY_VOTE_LAST_TX_ID)) || '0';
		this.createJob(
			'init.voting.data',
			{
				lastId,
			},
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('index.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('index.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
