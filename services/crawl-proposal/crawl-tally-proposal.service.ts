/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, Context, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { ProposalEntity } from '../../entities/proposal.entity';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { ProposalResponseFromApi } from 'types';
import { Action, Method } from '@ourparentcenter/moleculer-decorators-extended';

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
					async process(job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.url);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				crawlTally: {
					async handler(ctx: Context<{ id: string }>) {
						this.logger.debug(`Crawl tally by proposal: ${ctx.params.id}`);
						// @ts-ignore
						this.handleJob(ctx.params.id);
						return;
					},
				},
			},
		});
	}

	async handleJob(proposalId) {
		let url = `${Config.GET_ALL_PROPOSAL}/${proposalId}/tally`;

		let result = await this.callApi(URL_TYPE_CONSTANTS.LCD, url);
		this.logger.debug(result);

		let foundProposal = await this.adapter.findOne({
			proposal_id: `${proposalId}`,
		});
		if (foundProposal) {
			try {
				let res = await this.adapter.updateById(foundProposal.id, {
					$set: { tally: result.tally },
				});
				this.logger.debug(res);
			} catch (error) {
				this.logger.error(error);
			}
		} else {
			let proposal = new ProposalEntity();
		}
	}
	async _start() {
		this.getQueue('crawl.tally.proposal').on('completed', (job, res) => {
			this.logger.info(`Job #${JSON.stringify(job)} completed!. Result:`, res);
		});
		this.getQueue('crawl.tally.proposal').on('failed', (job, err) => {
			this.logger.error(`Job #${JSON.stringify(job)} failed!. Result:`, err);
		});
		this.getQueue('crawl.tally.proposal').on('progress', (job, progress) => {
			this.logger.info(`Job #${JSON.stringify(job)} progress is ${progress}%`);
		});
		return super._start();
	}
}
