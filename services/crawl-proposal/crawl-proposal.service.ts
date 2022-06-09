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

export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlProposal',
			version: 1,
			settings: {
				fields: [
					'_id',
					'proposal_id',
					'content',
					'status',
					'final_tally_result',
					'submit_time',
					'deposit_end_time',
					'voting_deposit',
					'voting_start_time',
					'voting_end_time',
				],
			},
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}`,
					{
						prefix: 'crawl.proposal',
						limiter: {
							max: 1,
							duration: 1000,
							bounceBack: true,
						},
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

	async sleep(ms) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}

	async handleJob(url) {
		let result: any[] = [];

		let urlToCall = url;
		while (true) {
			let resultCallApi = await this.callApi(urlToCall);
			result.push(resultCallApi);
			if (resultCallApi.pagination.next_key === null) {
				break;
			}
			urlToCall = `${url}pagination.key=${resultCallApi.pagination.next_key}`;
			this.sleep(1000);
		}
		this.logger.info(`result: ${JSON.stringify(result)}`);
		result.map((element) => {
			element.proposals.map(async (proposal) => {
				let foundProposal = await this.adapter.findOne({
					proposal_id: `${proposal.proposal_id}`,
				});
				try {
					if (foundProposal) {
						// this.logger.info(proposal);
						// const item: any = new JsonConvert().deserializeObject(proposal, ProposalEntity);
						let result = await this.adapter.updateById(foundProposal.id, proposal);
						this.logger.info(result);
					} else {
						const item: any = new JsonConvert().deserializeObject(
							proposal,
							ProposalEntity,
						);
						let id = await this.adapter.insert(item);
					}
				} catch (error) {
					this.logger.error(error);
				}
			});
		});
		return result;
	}
	async _start() {
		this.createJob(
			'crawl.proposal',
			{
				url: 'https://lcd.serenity.aura.network/cosmos/gov/v1beta1/proposals?pagination.limit=100&',
				// url: 'https://osmosistest-lcd.quickapi.com/cosmos/gov/v1beta1/proposals?pagination.limit=100&',
			},
			{
				removeOnComplete: true,
				repeat: {
					every: 5000,
				},
			},
		);
		// this.getQueue('crawl.proposal').on('global:progress', (jobID, progress) => {
		// 	this.logger.info(`Job #${jobID} progress is ${progress}%`);
		// });

		// this.getQueue('crawl.proposal').on('global:completed', (job, res) => {
		// 	this.logger.info(`Job #${job} completed!. Result:`, res);
		// });
		return super._start();
	}
}
