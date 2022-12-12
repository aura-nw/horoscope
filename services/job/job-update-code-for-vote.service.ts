/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { IVote } from 'entities/vote.entity';
import { Config } from '../../common';
import { dbVoteMixin } from '../../mixins/dbMixinMongoose/db-vote.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class InitVotingData extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'job-update-code-for-vote',
			version: 1,
			mixins: [
				queueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
				),
				dbVoteMixin,
				new RedisMixin().start(),
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

	public async handleJob() {
		const unprocessedVotes = (await this.adapter.lean({
			query: {
				code: {
					$exists: false,
				},
			},
		})) as IVote[];
		const queryIn_txhash = unprocessedVotes.map((vote) => vote.txhash) as string[];
		const listDataVote = (await this.broker.call('v1.handletransaction.find', {
			query: {
				'tx_response.txhash': {
					$in: queryIn_txhash,
				},
			},
			fields: ['tx_response.txhash', 'tx_response.code'],
		})) as [];
		const mapTxCode: Map<string, string> = new Map();
		listDataVote.forEach((e: any) => {
			mapTxCode.set(e.tx_response.txhash, e.tx_response.code);
		});
		unprocessedVotes.forEach((vote) => {
			// @ts-ignore
			vote.code = mapTxCode.get(vote.txhash);
		});

		// Await this.adapter.removeMany({
		// 	_id: {
		// 		$in: queryIn_id,
		// 	},
		// });
		// Await this.adapter.insertMany(unprocessedVotes);

		const listBulk: any[] = [];
		unprocessedVotes.map((vote: IVote) => {
			listBulk.push({
				updateOne: {
					filter: { _id: vote._id },
					update: {
						$set: {
							code: vote.code,
						},
					},
				},
			});
		});
		const resultUpdate = await this.adapter.bulkWrite(listBulk);
		this.logger.info('result update: ', resultUpdate);
		// This.logger.info([...mapTxCode.entries()]);
	}

	public async _start() {
		this.createJob(
			'update.code.vote',
			{},
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
