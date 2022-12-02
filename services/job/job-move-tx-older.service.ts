/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { ObjectId } from 'bson';
import { QueueConfig } from '../../config/queue';

export default class MoveTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'movetx',
			version: 1,
			mixins: [QueueService(QueueConfig.redis, QueueConfig.opts), dbTransactionMixin],
			queues: {
				'move.tx': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.listBlockHeight);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(listBlockHeight: string[]) {
		if (listBlockHeight && listBlockHeight.length) {
			listBlockHeight.map(async (height) => {
				let listTransactionInHeight: ITransaction[] = await this.adapter.lean({
					query: {
						'tx_response.height': height,
					},
				});
				//insert transaction to transaction-aggregate table
				this.createJob(
					'listtx.insert',
					{
						listTx: listTransactionInHeight,
					},
					{
						removeOnComplete: true,
						removeOnFail: {
							count: 10,
						},
					},
				);
				//delete transaction in transaction table
				let listBulk: any[] = [];
				listBulk = listTransactionInHeight.map((transaction) => {
					return {
						deleteOne: {
							filter: {
								//@ts-ignore
								_id: new ObjectId(transaction._id.toString()),
							},
						},
					};
				});
				let resultDeleteBlock = await this.adapter.bulkWrite(listBulk);
				this.logger.info('Result delete transaction: ', resultDeleteBlock);
			});
		}
	}

	async _start() {
		this.getQueue('move.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('move.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
