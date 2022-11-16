/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { IDepositProposalResponseFromLCD } from 'types';
import { IDeposit } from 'entities';
import { QueueConfig } from '../../config/queue';

export default class CrawlProposalService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbProposalMixin = dbProposalMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlDepositProposal',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbProposalMixin,
			],
			queues: {
				'crawl.deposit.proposal': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJobDeposit(job.data.id);
						job.progress(100);
						return true;
					},
				},
				// 'crawl.deposit.tx': {
				// 	concurrency: 1,
				// 	async process(job: Job) {
				// 		job.progress(10);
				// 		// @ts-ignore
				// 		await this.handleJobDepositTx(job.data.listTx);
				// 		job.progress(100);
				// 		return true;
				// 	},
				// },
			},
			events: {
				'proposal.depositing': {
					handler: (ctx: any) => {
						this.logger.debug(`Crawl deposit by proposal: ${ctx.params.id}`);

						this.createJob(
							'crawl.deposit.proposal',
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

	async handleJobDeposit(proposalId: String) {
		let path = `${Config.GET_ALL_PROPOSAL}/${proposalId}/deposits`;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let done = false;
		let resultCallApi: IDepositProposalResponseFromLCD;
		let listDeposit: IDeposit[] = [];
		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, path);

			listDeposit.push(...resultCallApi.deposits);
			if (resultCallApi.pagination.next_key === null) {
				done = true;
			} else {
				path = `${path}&pagination.key=${encodeURIComponent(
					resultCallApi.pagination.next_key.toString(),
				)}`;
			}
		}
		if (listDeposit.length == 0) {
			return;
		}
		this.logger.debug(listDeposit);
		let deposit = listDeposit.map((item: any) => ({
			depositor: item.depositor,
			amount: item.amount,
		}));

		let foundProposal = await this.adapter.findOne({
			proposal_id: `${proposalId}`,
			'custom_info.chain_id': Config.CHAIN_ID,
		});
		if (foundProposal) {
			try {
				let res = await this.adapter.updateById(foundProposal._id, {
					$set: { deposit: deposit },
				});
				this.logger.debug(res);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}
	async _start() {
		this.getQueue('crawl.deposit.proposal').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.deposit.proposal').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.deposit.proposal').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
