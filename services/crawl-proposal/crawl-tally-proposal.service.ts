/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, Context, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { ListTxCreatedParams } from 'types';
import { IProposal, ITransaction, IVoteTx } from 'entities';
import { QueueConfig } from '../../config/queue';

export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlTallyProposal',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
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
				'proposal.voting': {
					handler: (ctx: any) => {
						this.logger.debug(`Crawl tally by proposal: ${ctx.params.id}`);

						this.createJob(
							'crawl.tally.proposal',
							{
								id: ctx.params.id,
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
	async handleJob(proposalId: String) {
		let path = `${Config.GET_ALL_PROPOSAL}/${proposalId}/tally`;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let result = await this.callApiFromDomain(url, path);
		this.logger.debug(result);

		let [foundProposal, foundStakingPool]: [any, any] = await Promise.all([
			this.adapter.findOne({
				proposal_id: `${proposalId}`,
				'custom_info.chain_id': Config.CHAIN_ID,
			}),
			this.broker.call('v1.crawlPool.find', {
				query: {
					'custom_info.chain_id': Config.CHAIN_ID,
				},
			}),
		]);
		if (foundProposal) {
			try {
				let adding: any = { tally: result.tally };
				let tally = result.tally;
				if (foundStakingPool && foundStakingPool.length > 0) {
					let turnout =
						Number(
							((BigInt(tally.yes) +
								BigInt(tally.no) +
								BigInt(tally.abstain) +
								BigInt(tally.no_with_veto)) *
								BigInt(100000000)) /
								BigInt(foundStakingPool[0].bonded_tokens),
						) / 1000000;
					adding['turnout'] = turnout;
				}

				let res = await this.adapter.updateById(foundProposal._id, {
					$set: adding,
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
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.tally.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
