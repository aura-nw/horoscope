import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { Job } from 'bull';
import { dbVoteMixin } from '../../mixins/dbMixinMongoose/db-vote.mixin';
const QueueService = require('moleculer-bull');

export default class RemoveDuplicateVotingData extends Service {
	private redisMixin = new RedisMixin().start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'remove-duplicate-vote',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
				),
				dbVoteMixin,
				this.redisMixin,
			],
			queues: {
				'remove.duplicate.vote': {
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

	async handleJob() {
		for (let i = 0; ; i++) {
			this.logger.info(`Start job ${i}`);
			const vote = await this.adapter.find({
				query: {},
				sort: '_id',
				limit: 1,
				offset: i,
			});
			if (vote.length === 0) break;
			const listVote = await this.adapter.find({
				query: {
					'custom_info.chain_id': vote[0].custom_info.chain_id,
					voter_address: vote[0].voter_address,
					proposal_id: vote[0].proposal_id,
				},
				sort: '-_id',
				limit: 100,
				skip: 0,
			});
			// keep the first one
			if (listVote.length > 1) {
				for (let j = 1; j < listVote.length; j++) {
					const result = await this.adapter.removeById(listVote[j]._id.toString());
					this.logger.info(`Remove duplicate vote: ${result}`);
				}
			}
		}
		this.logger.info('Remove duplicate vote done');
		return;
	}

	async _start() {
		this.createJob(
			'remove.duplicate.vote',
			{},
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
