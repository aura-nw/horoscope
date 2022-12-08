import { Job } from 'bull';
import { FeegrantEntity } from 'entities';
import { Service, ServiceBroker } from 'moleculer';
import _ from 'lodash';
import { QueryOptions } from 'moleculer-db';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
import { FEEGRANT_STATUS } from '../../common/constant';
import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CronjobUpdateOriginalGrant extends Service {
	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'cronjobUpdateOriginGrant',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbFeegrantHistoryMixin],
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
	public async handleJob() {
		// Find all records which were unprocessed
		const listUnprocess = (await this.adapter.lean({
			query: {
				/* eslint-disable camelcase */
				origin_feegrant_txhash: null,
				result: true,
			},
			projection: {
				granter: 1,
				grantee: 1,
				origin_feegrant_txhash: 1,
				_id: 1,
				timestamp: 1,
				action: 1,
				amount: 1,
				status: 1,
				tx_hash: 1,
			},
			limit: 2000,
		})) as FeegrantEntity[];
		if (listUnprocess.length > 0) {
			// List bulk action to update feegrant history db
			const bulkUpdate: any[] = [];
			// Get distict pairs (granter, grantee) in listUnprocess
			const distinctPairGranterGrantee = _.uniqBy(listUnprocess, (elem) =>
				[elem.granter, elem.grantee].join(),
			).map((e) => _.pick(e, ['granter', 'grantee']));
			// Construct query
			const query: QueryOptions = {};
			const queryOr: any[] = [];
			distinctPairGranterGrantee.forEach((e) => {
				queryOr.push({
					granter: e.granter,
					grantee: e.grantee,
				});
			});
			query.$or = queryOr;
			query.status = FEEGRANT_STATUS.AVAILABLE;
			query.result = true;
			// Find grant for each distinctPairGranterGrantee
			const listOriginalFeegrant: any[] = await this.broker.call('v1.feegrantDb.find', {
				query,
			});
			// List to update feegrant DB
			const listUpdateFeegrantDb: FeegrantEntity[] = [];
			// Find origin_feegrant_txhash for each unprocessed action
			// Construct bulk update origin_feegrant_txhash for each unprocess action
			listUnprocess.forEach((e) => {
				// E 's original feegrant
				// Each unprocessed action: find original by looking up feegrant which has timestamp is max of all less than or equal its timestamp
				const suspiciousFeegrants = listOriginalFeegrant.filter(
					(x) =>
						x.grantee === e.grantee &&
						x.granter === e.granter &&
						x.timestamp.getTime() < e.timestamp.getTime(),
				);
				if (suspiciousFeegrants.length > 0) {
					const originalFeegrant = suspiciousFeegrants.reduce((prev, current) =>
						prev.timestamp.getTime() > current.timestamp.getTime() ? prev : current,
					);
					e.origin_feegrant_txhash = originalFeegrant.tx_hash;
					listUpdateFeegrantDb.push(e);
					bulkUpdate.push({
						updateOne: {
							// eslint-disable-next-line no-underscore-dangle
							filter: { _id: e._id },
							update: {
								$set: {
									origin_feegrant_txhash: originalFeegrant.tx_hash,
								},
							},
						},
					});
				}
			});
			/* eslint-enable camelcase */
			// Forward all unprocessed actions to feegrant db service
			if (process.env.NODE_ENV !== 'test') {
				this.createJob(
					'feegrant.db',
					{
						listUpdateFeegrantDb,
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 10,
						},
					},
				);
			}
			await this.adapter.bulkWrite(bulkUpdate);
		}
	}

	public async _start() {
		if (process.env.NODE_ENV !== 'test') {
			this.createJob(
				'cronjob.update-origin-grant',
				{},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
					repeat: {
						every: parseInt(Config.MILISECOND_PER_BATCH, 10),
					},
				},
			);
		}

		this.getQueue('cronjob.update-origin-grant').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('cronjob.update-origin-grant').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('cronjob.update-origin-grant').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
