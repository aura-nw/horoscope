/* eslint-disable camelcase */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ObjectId } from 'mongodb';
import { IVote } from 'entities/vote.entity';
import { FEEGRANT_STATUS } from 'common/constant';
import { ITransaction } from '../../entities';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class UpdateOriginalRevoke extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'feegrant-update-update-original-revoke-txhash',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbFeegrantMixin,
				new RedisMixin().start(),
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

	public async handleJob() {
		const listTxRevoke = (await this.broker.call('v1.feegrantHistoryDb.find', {
			query: {
				status: FEEGRANT_STATUS.REVOKED,
				result: true,
			},
			fields: ['tx_hash', 'origin_feegrant_txhash'],
		})) as [];
		this.logger.info(JSON.stringify(listTxRevoke));
		const bulkUpdate = [] as any[];
		listTxRevoke.forEach((e) => {
			bulkUpdate.push({
				updateOne: {
					filter: {
						// @ts-ignore
						origin_feegrant_txhash: e.origin_feegrant_txhash,
					},
					update: {
						$set: {
							// @ts-ignore
							origin_revoke_txhash: e.tx_hash,
						},
					},
				},
			});
		});
		this.logger.info(JSON.stringify(bulkUpdate));
		await this.adapter.bulkWrite(bulkUpdate);
	}

	public async _start() {
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
