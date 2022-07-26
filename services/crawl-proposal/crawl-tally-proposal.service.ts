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
				'crawl.voting.tx': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJobVotingTx(job.data.listTx);
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
							},
						);
						return;
					},
				},
				'list-tx.upsert': {
					handler: (ctx: Context<ListTxCreatedParams, Record<string, unknown>>) => {
						this.logger.debug(`Crawl deposit by tx`);
						this.createJob(
							'crawl.voting.tx',
							{
								listTx: ctx.params.listTx,
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
	async handleJobVotingTx(listTx: ITransaction[]) {
		listTx.map(async (tx: ITransaction) => {
			if (tx.tx_response.code == '0') {
				let listMessage = tx.tx.body.messages;
				listMessage.map(async (message: any) => {
					if (message['@type'] == MSG_TYPE.MSG_VOTE) {
						let voteTx = {
							voter: message.voter,
							option: message.option,
							txhash: tx.tx_response.txhash,
						};
						let foundProposal: IProposal = await this.adapter.findOne({
							proposal_id: Number(message.proposal_id),
							'custom_info.chain_id': Config.CHAIN_ID,
						});
						if (foundProposal) {
							let foundVoterIndex = foundProposal.list_tx_vote.findIndex(
								(voter: IVoteTx) => voter.voter == voteTx.voter,
							);
							if (foundVoterIndex != -1) {
								foundProposal.list_tx_vote[foundVoterIndex].option = voteTx.option;
								foundProposal.list_tx_vote[foundVoterIndex].txhash = voteTx.txhash;
							} else {
								foundProposal.list_tx_vote.push(voteTx);
							}
							await this.adapter.updateById(foundProposal._id, foundProposal);
						}
					}
				});
			}
		});
	}
	async handleJob(proposalId: String) {
		let path = `${Config.GET_ALL_PROPOSAL}/${proposalId}/tally`;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let result = await this.callApiFromDomain(url, path);
		this.logger.debug(result);

		let foundProposal = await this.adapter.findOne({
			proposal_id: `${proposalId}`,
			'custom_info.chain_id': Config.CHAIN_ID,
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
