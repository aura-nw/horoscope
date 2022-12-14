/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { FeegrantEntity } from 'entities/feegrant.entity';
import _ from 'lodash';
import { Service, ServiceBroker } from 'moleculer';
import { queueConfig } from '../../config/queue';
import { Config } from '../../common';
import { FEEGRANT_ACTION, FEEGRANT_STATUS } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

interface IUpdateContent {
	amount: number;
	status: FEEGRANT_STATUS;
}
export default class FeegrantDB extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'feegrantDb',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbFeegrantMixin,
			],
			queues: {
				'feegrant.db': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);

						// @ts-ignore
						this.handleJob(job.data.listUpdateFeegrantDb);

						job.progress(100);
						return true;
					},
				},
				'feegrant-check-expire.db': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);

						// @ts-ignore
						await this.handleJobCheckExpire();

						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJobCheckExpire() {
		// Check expired
		await this.adapter.updateMany(
			{
				expiration: {
					$lte: new Date(),
				},
				status: FEEGRANT_STATUS.AVAILABLE,
			},
			{
				$set: {
					expired: true,
				},
			},
		);
	}

	async handleJob(listUpdateFeegrantDb: FeegrantEntity[]): Promise<any[]> {
		// Process unprocess actions: use, revoke, use up
		const mapUpdate = new Map<string | null, IUpdateContent>();
		// List Revoke
		const listRevoke = [] as FeegrantEntity[];
		// Initialize map
		for (const e of listUpdateFeegrantDb) {
			if (e.action === FEEGRANT_ACTION.USE || e.action === FEEGRANT_ACTION.REVOKE) {
				// @ts-ignore
				mapUpdate.set(e.origin_feegrant_txhash, {
					amount: 0,
					status: FEEGRANT_STATUS.AVAILABLE,
				});
			}
		}
		// Update map
		for (const e of listUpdateFeegrantDb) {
			// For each new used record received, update spendable
			if (e.action === FEEGRANT_ACTION.USE) {
				// @ts-ignore
				const tmpAmount =
					// @ts-ignore
					// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
					mapUpdate.get(e.origin_feegrant_txhash?.toString() ?? null)?.amount +
					parseInt(e.amount.amount.toString(), 10);

				// @ts-ignore
				const tmpStatus = mapUpdate?.get(e.origin_feegrant_txhash)?.status;
				// @ts-ignore
				mapUpdate.set(e.origin_feegrant_txhash, {
					amount: tmpAmount,
					// @ts-ignore
					status: tmpStatus,
				});
			} else if (e.action === FEEGRANT_ACTION.REVOKE) {
				if (e.status === FEEGRANT_STATUS.USE_UP) {
					// For each new used up record received, update status to use up
					const tmpAmount = mapUpdate.get(
						e.origin_feegrant_txhash?.toString() ?? null,
					)?.amount;
					const tmpStatus = FEEGRANT_STATUS.USE_UP;

					mapUpdate.set(e.origin_feegrant_txhash?.toString() ?? null, {
						// @ts-ignore
						amount: tmpAmount,
						status: tmpStatus,
					});
				} else {
					// For each new revoked record received, update status to revoked
					const tmpAmount = mapUpdate.get(
						e.origin_feegrant_txhash?.toString() ?? null,
					)?.amount;
					const tmpStatus = FEEGRANT_STATUS.REVOKED;
					listRevoke.push(e);
					mapUpdate.set(e.origin_feegrant_txhash?.toString() ?? null, {
						// @ts-ignore
						amount: tmpAmount,
						status: tmpStatus,
					});
				}
			}
		}
		const bulkUpdate = [] as any[];
		const listOriginalRecords = (await this.adapter.lean({
			query: {
				/* eslint-disable camelcase */
				tx_hash: {
					$in: Array.from(mapUpdate.keys()),
				},
			},
			projection: {
				tx_hash: 1,
				amount: 1,
			},
		})) as FeegrantEntity[];
		listOriginalRecords.forEach((e) => {
			if (!_.isEmpty(e.amount)) {
				this.logger.info(JSON.stringify(e.amount));
				bulkUpdate.push({
					updateOne: {
						filter: { tx_hash: e.tx_hash },
						update: {
							$set: {
								// @ts-ignore
								'amount.amount': e.amount.amount
									? parseInt(e.amount.amount.toString(), 10) -
									  (mapUpdate?.get(e.tx_hash.toString())?.amount ?? 0)
									: null,
								status: mapUpdate.get(e.tx_hash.toString())?.status,
							},
						},
					},
				});
			} else {
				bulkUpdate.push({
					updateOne: {
						filter: { tx_hash: e.tx_hash },
						update: {
							$set: {
								status: mapUpdate.get(e.tx_hash.toString())?.status,
							},
						},
					},
				});
			}
		});
		await this.adapter.bulkWrite(bulkUpdate);
		const bulkUpdateOriginRevoke = [] as any[];
		listRevoke.forEach((e) => {
			bulkUpdateOriginRevoke.push({
				updateOne: {
					filter: { tx_hash: e.origin_feegrant_txhash },
					update: {
						$set: {
							origin_revoke_txhash: e.tx_hash,
						},
					},
				},
			});
		});
		/* eslint-enable camelcase */
		await this.adapter.bulkWrite(bulkUpdateOriginRevoke);
		return [];
	}

	public async _start() {
		if (process.env.NODE_ENV !== 'test') {
			this.createJob(
				'feegrant-check-expire.db',
				{},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: 10,
					},
					repeat: {
						every: parseInt(Config.MILISECOND_CHECK_EXPIRE, 10),
					},
				},
			);
		}
		this.getQueue('feegrant.db').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('feegrant.db').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('feegrant.db').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		this.getQueue('feegrant-check-expire.db').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('feegrant-check-expire.db').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('feegrant-check-expire.db').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
