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

export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlProposal',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.proposal',
					},
				),
				this.callApiMixin,
				this.dbProposalMixin,
			],
			queues: {
				'crawl.proposal': {
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
		});
	}

	async handleJob(url) {
		let listProposal: ProposalEntity[] = [];

		let urlToCall = url;
		let resultCallApi: ProposalResponseFromApi;

		let done = false;

		while (!done) {
			resultCallApi = await this.callApi(URL_TYPE_CONSTANTS.LCD, urlToCall);

			listProposal.push(...resultCallApi.proposals);
			if (resultCallApi.pagination.next_key === null) {
				done = true;
			} else {
				urlToCall = `${url}&pagination.key=${resultCallApi.pagination.next_key}`;
			}
		}

		this.logger.info(`result: ${JSON.stringify(listProposal)}`);

		listProposal.map(async (proposal) => {
			let foundProposal = await this.adapter.findOne({
				proposal_id: `${proposal.proposal_id}`,
			});
			try {
				if (foundProposal) {
					let result = await this.adapter.updateById(foundProposal.id, proposal);
					this.logger.info(result);
				} else {
					const item: any = new JsonConvert().deserializeObject(proposal, ProposalEntity);
					let id = await this.adapter.insert(item);
				}
			} catch (error) {
				this.logger.error(error);
			}
		});
	}
	async _start() {
		this.createJob(
			'crawl.proposal',
			{
				url: `${Config.GET_ALL_PROPOSAL}?pagination.limit=${Config.NUMBER_OF_PROPOSAL_PER_CALL}&pagination.countTotal=true`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_PROPOSAL, 10),
				},
			},
		);
		this.getQueue('crawl.proposal').on('completed', (job, res) => {
			this.logger.info(`Job #${JSON.stringify(job)} completed!. Result:`, res);
		});
		this.getQueue('crawl.proposal').on('failed', (job, err) => {
			this.logger.error(`Job #${JSON.stringify(job)} failed!. Result:`, err);
		});
		this.getQueue('crawl.proposal').on('progress', (job, progress) => {
			this.logger.info(`Job #${JSON.stringify(job)} progress is ${progress}%`);
		});
		return super._start();
	}
}
