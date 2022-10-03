/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';
import createBullService from '../../mixins/customMoleculerBull';
import { Job } from 'bull';
import { dbBlockAggregateMixin } from '../../mixins/dbMixinMongoose';
import { IBlock } from 'entities';
import QueueConfig from '../../config/queue';

export default class BlockAggregateService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'blockAggregate',
			version: 1,
			mixins: [
				createBullService(QueueConfig.redis, QueueConfig.opts),
				dbBlockAggregateMixin,
			],
			queues: {
				'listblock.insert': {
					concurrency: 10,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.listBlock);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'job.moveblock': {
					handler: (ctx: any) => {
						this.createJob(
							'listblock.insert',
							{
								listBlock: ctx.params.listBlock,
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

	async handleJob(listBlock: IBlock[]) {
		let listBulk: any[] = [];
		if (!listBlock) return;
		listBlock.map(async (block: IBlock) => {
			listBulk.push({
				insertOne: {
					document: block,
				},
			});
		});
		let result = await this.adapter.bulkWrite(listBulk);
		this.logger.info(`Update block: ${listBlock.length}`, result);
	}

	async _start() {
		this.getQueue('listblock.insert').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('listblock.insert').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('listblock.insert').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'listblock.insert' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
