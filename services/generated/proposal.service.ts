/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ProposalSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/gov';
import { QueryProposalsResponseSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/query';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { ProposalEntity } from '../../entities/proposal.entity';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { MAPPER_CONFIG } from '../../config/mapper';
import { AutoMapperUtil } from '../../utils/auto-mapper';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
export default class CrawlProposalService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlProposal',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				dbProposalMixin,
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

	async handleJob(path: string) {
		const listProposal: ProposalSDKType[] = [];

		let param = path;

		let resultCallApi: QueryProposalsResponseSDKType;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, param);
			listProposal.push(...resultCallApi.proposals);
			const key = resultCallApi.pagination?.next_key;
			if (resultCallApi?.pagination?.next_key === null) {
				done = true;
			} else {
				if (key) {
					const text = Buffer.from(key).toString();
					param = `${path}&pagination.key=${encodeURIComponent(text)}`;
				}
			}
		}

		this.logger.info('list proposal is: ', listProposal.length);
		listProposal.map((proposal) => {
			const proposalSaveToDB = AutoMapperUtil.mapEntity(
				MAPPER_CONFIG.PROPOSAL_MAPPING,
				new ProposalEntity(),
				proposal,
			);
			this.logger.info(JSON.stringify(proposalSaveToDB));
		});
	}

	public async _start() {
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
