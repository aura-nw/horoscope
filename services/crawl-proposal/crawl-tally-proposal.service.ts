/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlProposalService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlTallyProposal',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbProposalMixin,
				new CallApiMixin().start(),
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
				'proposal.voting': {
					handler: (ctx: any) => {
						this.logger.debug(`Crawl tally by proposal: ${ctx.params.id}`);

						this.createJob(
							'crawl.tally.proposal',
							{
								id: ctx.params.id,
							},
							{
								jobId: ctx.params.id,
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
	async handleJob(proposalId: string) {
		const path = `${Config.GET_ALL_PROPOSAL}/${proposalId}/tally`;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		const result = await this.callApiFromDomain(url, path);
		this.logger.debug(result);

		const [foundProposal, foundStakingPool]: [any, any] = await Promise.all([
			this.adapter.findOne({
				// eslint-disable-next-line camelcase
				proposal_id: `${proposalId}`,
			}),
			this.broker.call('v1.crawlPool.find', {
				query: {},
			}),
		]);
		if (foundProposal) {
			try {
				const adding: any = { tally: result.tally };
				const tally = result.tally;
				if (foundStakingPool && foundStakingPool.length > 0) {
					const turnout =
						Number(
							((BigInt(tally.yes) +
								BigInt(tally.no) +
								BigInt(tally.abstain) +
								BigInt(tally.no_with_veto)) *
								BigInt(100000000)) /
								BigInt(foundStakingPool[0].bonded_tokens),
						) / 1000000;
					adding.turnout = turnout;
				}

				// eslint-disable-next-line no-underscore-dangle
				const res = await this.adapter.updateById(foundProposal._id, {
					$set: adding,
				});
				this.logger.debug(res);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}
	public async _start() {
		this.getQueue('crawl.tally.proposal').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.tally.proposal').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.tally.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
