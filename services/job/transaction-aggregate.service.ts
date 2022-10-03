/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { dbTransactionAggregateMixin } from '../../mixins/dbMixinMongoose';
import { ITransaction } from 'entities';
import QueueConfig from '../../config/queue';

export default class TxAggregateService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'transactionAggregate',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
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
		let listBulk: any[] = [];
		if (!listTx) return;
		listTx.map(async (tx: ITransaction) => {
			listBulk.push({
				insertOne: {
					document: tx,
				},
			});
		});
		let result = await this.adapter.bulkWrite(listBulk);
		this.logger.debug(`Update tx: ${listTx.length}`, result);
	}

	async _start() {
		this.getQueue('listtx.insert').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('listtx.insert').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('listtx.insert').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'listtx.insert' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
