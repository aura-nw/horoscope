import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import { dbTransactionMixin } from './../../mixins/dbMixinMongoose';
import RedisMixin from './../../mixins/redis/redis.mixin';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { ITransaction } from '../../entities';
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
						this.handleJob(job.data.lastId, job.data.stopPoint);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(lastTxId: string, stopPoint?: string) {
		
		let query: any = {};
		if (lastTxId !== '0') query = { _id: { $gt: new ObjectId(lastTxId) } }

		this.logger.info(`stopPoint: ${stopPoint}, lastTxId: ${lastTxId}`);
		if (stopPoint && lastTxId > stopPoint) return true;
		if (stopPoint) {
			query =
				lastTxId === '0'
					? { _id: { $lt: new ObjectId(stopPoint) } }
					: { _id: { $gt: new ObjectId(lastTxId), $lt: new ObjectId(stopPoint) } };
		}
		
		const listTx: ITransaction[] = await this.adapter.find({
			query,
			sort: '_id',
			limit: 100,
			skip: 0,
		});

		if (listTx.length > 0) {
			const lastId = listTx.at(-1)?._id;
			this.logger.info(`lastId: ${lastId}`);
			this.redisClient.set(Config.REDIS_KEY_VOTE_LAST_TX_ID, lastId?.toString());
			const stopPoint = Config.SCAN_TX_STOP_POINT;
			this.createJob('init.voting.data', { lastId, stopPoint }, { removeOnComplete: true });
			await this.broker.call(Config.SCAN_TX_ACTION, { listTx });
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
