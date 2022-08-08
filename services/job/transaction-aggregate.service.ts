/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { dbTransactionAggregateMixin } from '../../mixins/dbMixinMongoose';
import { ITransaction } from 'entities';

export default class MoveTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'transactionAggregate',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'listtx.create',
					},
				),
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
							},
						);
						return;
					},
				},
			},
		});
	}

	async initEnv() {}
	async handleJob(listTx: ITransaction[]) {
		await this.adapter.insertMany(listTx);
	}

	async _start() {
		this.adapter
			.aggregate([
				{
					$match: {
						'tx_response.txhash': {
							$eq: '34EED4766E15AE86E1F0FD8BFC99BB1CE999682E52FB13F2604E2231C5F179F4',
						},
					},
				},
				{
					$group: {
						_id: { txhash: '$tx_response.txhash' },
						count: { $sum: 1 },
					},
				},
			])
			.then((result: any) => {
				console.log(result);
			})
			.catch((err: any) => {
				console.log(err);
			})
			.finally(() => {
				console.log('done');
			});

		this.getQueue('listtx.insert').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('listtx.insert').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('listtx.insert').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		return super._start();
	}
}
