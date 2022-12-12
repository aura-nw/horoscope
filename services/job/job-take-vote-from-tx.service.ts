/* eslint-disable no-underscore-dangle */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { Config } from '../../common';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { ITransaction } from '../../entities';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class InitVotingData extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'job-take-vote-from-tx',
			version: 1,
			mixins: [
				queueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
				),
				dbTransactionMixin,
				new RedisMixin().start(),
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

	public async handleJob(lastTxId: string, stopPoint?: string) {
		let query: any = {};
		if (lastTxId !== '0') {
			query = {
				_id: { $gt: new ObjectId(lastTxId) },
				'indexes.message_action': '/cosmos.gov.v1beta1.MsgVote',
			};
		}

		this.logger.info(`stopPoint: ${stopPoint}, lastTxId: ${lastTxId}`);
		if (stopPoint && lastTxId > stopPoint) {
			return true;
		}
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
			const stopPoint2 = Config.SCAN_TX_STOP_POINT;
			this.createJob('init.voting.data', { lastId, stopPoint2 }, { removeOnComplete: true });
			await this.broker.call(Config.SCAN_TX_ACTION, { listTx });
		}
		return true;
	}

	public async _start() {
		this.redisClient = await this.getRedisClient();
		const lastId = (await this.redisClient.get(Config.REDIS_KEY_VOTE_LAST_TX_ID)) || '0';
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
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
