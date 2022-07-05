/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { IProposal, ProposalEntity } from '../../entities/proposal.entity';
import { Config } from '../../common';
import { PROPOSAL_STATUS, URL_TYPE_CONSTANTS } from '../../common/constant';
import { IProposalResponseFromLCD } from '../../types';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';

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
					async process(job: Job) {
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

	async handleJob(path: String) {
		let listProposal: IProposal[] = [];

		let param = path;
		let resultCallApi: IProposalResponseFromLCD;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, param);

			listProposal.push(...resultCallApi.proposals);
			if (resultCallApi.pagination.next_key === null) {
				done = true;
			} else {
				param = `${path}&pagination.key=${encodeURIComponent(
					resultCallApi.pagination.next_key.toString(),
				)}`;
			}
		}

		this.logger.debug(`result: ${JSON.stringify(listProposal)}`);

		listProposal.map(async (proposal) => {
			let foundProposal: ProposalEntity = await this.adapter.findOne({
				proposal_id: `${proposal.proposal_id}`,
				'custom_info.chain_id': Config.CHAIN_ID,
			});
			// this.broker.emit('proposal.upsert', { id: proposal.proposal_id });
			if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
				this.broker.emit('proposal.upsert', { id: proposal.proposal_id });
			}
			try {
				if (foundProposal) {
					proposal._id = foundProposal._id;
					await this.adapter.updateById(foundProposal._id, proposal);
				} else {
					const item: any = new JsonConvert().deserializeObject(proposal, ProposalEntity);
					let id = await this.adapter.insert(item);
					this.logger.info(`inserted: ${id}`);
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

		this.getQueue('crawl.proposal').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.proposal').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
