/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Context, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';

export default class CrawlBlockService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlblock',
			version: 1,
			mixins: [QueueService('redis://default:hxQC4YzFcW@127.0.0.1:6379')],
			queues: {
				'tuan.test': {
					concurrency: 1,
					async process(job) {
						job.progress(10);
						// @ts-ignore
						this.logger.info('New job received! tuan-test', job.data);
						// @ts-ignore
						this.callbackHandle(job.data.id);
						job.progress(99);
						return true;
					},
				},
			},
		});
	}

	callbackHandle(id) {
		this.logger.info('id ne: ', id);
	}

	_start() {
		this.broker.cacher?.set('time', 123);
		let id = 1;
		setInterval(() => {
			this.logger.info('Add a new job. ID:', id);
			this.createJob(
				'tuan.test',
				{
					id: id++,
					pid: process.pid,
					tuanname: 'tuan',
				},
				this.callbackHandle,
			);
		}, 2000);

		this.getQueue('tuan.test').on('global:progress', (jobID, progress) => {
			this.logger.info(`Job #${jobID} progress is ${progress}%`);
		});

		this.getQueue('tuan.test').on('global:completed', (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});
		this.logger.info('start to live');
		// this.live();
		return super._start();
	}
}
