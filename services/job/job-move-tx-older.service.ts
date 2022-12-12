/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Context, ServiceBroker } from 'moleculer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Job } from 'bull';
import { ObjectId } from 'bson';
import { ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class MoveTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'movetx',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbTransactionMixin],
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
				const listTransactionInHeight: ITransaction[] = await this.adapter.lean({
					query: {
						'tx_response.height': height,
					},
				});
				// Insert transaction to transaction-aggregate table
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
				// Delete transaction in transaction table
				let listBulk: any[] = [];
				listBulk = listTransactionInHeight.map((transaction) => ({
					deleteOne: {
						filter: {
							// @ts-ignore
							_id: new ObjectId(transaction._id.toString()),
						},
					},
				}));
				const resultDeleteBlock = await this.adapter.bulkWrite(listBulk);
				this.logger.info('Result delete transaction: ', resultDeleteBlock);
			});
		}
	}

	public async _start() {
		this.getQueue('move.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('move.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
