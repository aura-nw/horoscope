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

		let listProposalInDB: ProposalEntity[] = await this.adapter.lean({
			query: {},
		});
		let listPromise: Promise<any>[] = [];
		let listIndexDelete: number[] = [];
		await Promise.all(
			listProposal.map(async (proposal) => {
				if (proposal.proposal_id == undefined) {
					this.logger.error(`proposal_id is undefined`);
				}
				if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD) {
					this.broker.emit('proposal.depositing', { id: proposal.proposal_id });
				}

				// this.broker.emit('proposal.upsert', { id: proposal.proposal_id });
				if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
					this.broker.emit('proposal.voting', { id: proposal.proposal_id });
				}
				let foundProposal = listProposalInDB.find(
					(item: ProposalEntity) => item.proposal_id == proposal.proposal_id,
				);
				let foundProposalIndex = listProposalInDB.findIndex(
					(item: ProposalEntity) => item.proposal_id == proposal.proposal_id,
				);

				try {
					if (foundProposal) {
						proposal._id = foundProposal._id;
						if (
							foundProposal.proposal_id &&
							(!foundProposal.proposer_address || !foundProposal.initial_deposit)
						) {
							let proposer = await this.getProposerBySearchTx(
								foundProposal.proposal_id,
							);
							if (proposer?.nameValidator) {
								proposal.proposer_name = proposer.nameValidator;
							}
							if (proposer?.proposalAddress) {
								proposal.proposer_address = proposer.proposalAddress;
							}
							if (proposer?.initialDeposit) {
								proposal.initial_deposit = proposer.initialDeposit;
							}
						}
						listPromise.push(this.adapter.updateById(foundProposal._id, proposal));
					} else {
						const item: ProposalEntity = new JsonConvert().deserializeObject(
							proposal,
							ProposalEntity,
						);
						listPromise.push(this.adapter.insert(item));
					}
					if (foundProposalIndex > -1 && foundProposal) {
						listIndexDelete.push(foundProposalIndex);
					}
				} catch (error) {
					this.logger.error(error);
				}
			}),
		);
		await Promise.all(
			listIndexDelete.map((index) => {
				delete listProposalInDB[index];
			}),
		);

		await Promise.all(
			listProposalInDB.map(async (proposal: ProposalEntity) => {
				proposal.status = PROPOSAL_STATUS.PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT;
				listPromise.push(this.adapter.updateById(proposal._id, proposal));
			}),
		);

		await Promise.all(listPromise);
	}

	async getProposerBySearchTx(proposalId: string) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		const resultCallApi = await this.callApiFromDomain(
			url,
			`${Config.GET_TX_API_EVENTS}?events=submit_proposal.proposal_id=${proposalId}`,
		);
		try {
			const initialDeposit = resultCallApi.txs[0].body.messages[0].initial_deposit;
			const proposerAddress = resultCallApi.txs[0].body.messages[0].proposer;
			let result: any = await this.broker.call('v1.crawlValidator.find', {
				query: {
					'custom_info.chain_id': Config.CHAIN_ID,
					account_address: proposerAddress,
				},
			});
			if (result && result.length > 0) {
				const nameValidator = result[0].description.moniker;
				return {
					proposalAddress: proposerAddress,
					nameValidator: nameValidator,
					initialDeposit: initialDeposit,
				};
			} else {
				return {
					proposalAddress: proposerAddress,
					initialDeposit: initialDeposit,
				};
			}
		} catch (error) {
			this.logger.error(error);
		}
		return null;
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
