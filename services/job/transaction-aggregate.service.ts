/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { ITransaction } from 'entities';
import { dbTransactionAggregateMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class TxAggregateService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'transactionAggregate',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbTransactionAggregateMixin,
			],
			queues: {
				'listtx.insert': {
					concurrency: 10,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.listTx);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'job.movetx': {
					handler: (ctx: any) => {
						this.createJob(
							'listtx.insert',
							{
								listTx: ctx.params.listTx,
							},
							{
								removeOnComplete: true,
								removeOnFail: {
									count: 10,
								},
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listTx: ITransaction[]) {
		const listBulk: any[] = [];
		if (!listTx) {
			return;
		}
		listTx.map(async (tx: ITransaction) => {
			listBulk.push({
				insertOne: {
					document: tx,
				},
			});
		});
		const result = await this.adapter.bulkWrite(listBulk);
		this.logger.debug(`Update tx: ${listTx.length}`, result);
	}

	public async _start() {
		this.getQueue('listtx.insert').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('listtx.insert').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('listtx.insert').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
