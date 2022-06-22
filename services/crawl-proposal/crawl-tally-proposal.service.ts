/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, Context, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';

export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlTallyProposal',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.tally.proposal',
					},
				),
				this.callApiMixin,
				this.dbProposalMixin,
			],
			queues: {
				'crawl.tally.proposal': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.id);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'proposal.upsert': {
					handler: (ctx: any) => {
						this.logger.debug(`Crawl tally by proposal: ${ctx.params.id}`);

						this.createJob(
							'crawl.tally.proposal',
							{
								id: ctx.params.id,
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

	async handleJob(proposalId: String) {
		let url = `${Config.GET_ALL_PROPOSAL}/${proposalId}/tally`;

		let result = await this.callApi(URL_TYPE_CONSTANTS.LCD, url);
		this.logger.debug(result);

		let foundProposal = await this.adapter.findOne({
			proposal_id: `${proposalId}`,
		});
		if (foundProposal) {
			try {
				let res = await this.adapter.updateById(foundProposal._id, {
					$set: { tally: result.tally },
				});
				this.logger.debug(res);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}
	async _start() {
		this.getQueue('crawl.tally.proposal').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.tally.proposal').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.tally.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
