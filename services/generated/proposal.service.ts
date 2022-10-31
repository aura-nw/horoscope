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
import { QueueConfig } from '../../config/queue';
import {
	Proposal,
	ProposalStatus,
	ProposalSDKType,
} from 'osmojs/types/codegen/cosmos/gov/v1beta1/gov';
import { QueryProposalsResponseSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/query';
import { MAPPER_CONFIG } from '../../config/mapper';
import { AutoMapperUtil } from '../../utils/auto-mapper';
export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlProposal',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
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
		let listProposal: ProposalSDKType[] = [];

		let param = path;

		let resultCallApi: QueryProposalsResponseSDKType;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, param);
			listProposal.push(...resultCallApi.proposals);
			let key = resultCallApi.pagination?.next_key;
			if (resultCallApi?.pagination?.next_key === null) {
				done = true;
			} else {
				if (key) {
					let text = Buffer.from(key).toString();
					param = `${path}&pagination.key=${encodeURIComponent(text)}`;
				}
			}
		}

		this.logger.info('list proposal is: ', listProposal.length);
		listProposal.map((proposal) => {
			let proposalSaveToDB = AutoMapperUtil.mapEntity(
				MAPPER_CONFIG.PROPOSAL_MAPPING,
				new ProposalEntity(),
				proposal,
			);
			this.logger.info(JSON.stringify(proposalSaveToDB));
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
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_PROPOSAL, 10),
				},
			},
		);

		this.getQueue('crawl.proposal').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.proposal').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
