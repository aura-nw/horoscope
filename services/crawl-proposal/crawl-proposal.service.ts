/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { IProposal, ProposalEntity } from '../../entities/proposal.entity';
import { Config } from '../../common';
import { PROPOSAL_STATUS, URL_TYPE_CONSTANTS } from '../../common/constant';
import { IProposalResponseFromLCD } from '../../types';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
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
				dbProposalMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.proposal': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob() {
		const path = `${Config.GET_ALL_PROPOSAL}?pagination.limit=${Config.NUMBER_OF_PROPOSAL_PER_CALL}&pagination.countTotal=true`;
		const listProposal: IProposal[] = [];

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

		const listProposalInDB: ProposalEntity[] = await this.adapter.lean({
			query: {},
		});
		const listBulk: any[] = [];
		const listIndexDelete: number[] = [];
		await Promise.all(
			listProposal.map(async (proposal) => {
				if (proposal.proposal_id === undefined) {
					this.logger.error('proposal_id is undefined');
				}
				if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_DEPOSIT_PERIOD) {
					this.broker.emit('proposal.depositing', { id: proposal.proposal_id });
				}

				// This.broker.emit('proposal.upsert', { id: proposal.proposal_id });
				if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
					this.broker.emit('proposal.voting', { id: proposal.proposal_id });
				}
				const foundProposal = listProposalInDB.find(
					// eslint-disable-next-line eqeqeq
					(item: ProposalEntity) => item.proposal_id == proposal.proposal_id,
				);
				const foundProposalIndex = listProposalInDB.findIndex(
					// eslint-disable-next-line eqeqeq
					(item: ProposalEntity) => item.proposal_id == proposal.proposal_id,
				);

				try {
					if (foundProposal) {
						/* eslint-disable no-underscore-dangle, camelcase */
						proposal._id = foundProposal._id;
						if (
							foundProposal.proposal_id &&
							(!foundProposal.proposer_address || !foundProposal.initial_deposit)
						) {
							const proposer = await this.getProposerBySearchTx(
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
						listBulk.push({
							updateOne: { filter: { _id: foundProposal._id }, update: proposal },
						});
					} else {
						const item: ProposalEntity = new JsonConvert().deserializeObject(
							proposal,
							ProposalEntity,
						);
						listBulk.push({ insertOne: { document: item } });
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
				listBulk.push({
					updateOne: { filter: { _id: proposal._id }, update: proposal },
				});
			}),
		);

		// Await Promise.all(listPromise);
		const result = await this.adapter.bulkWrite(listBulk);
		this.logger.info(result);
	}

	async getProposerBySearchTx(proposalId: string) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		const resultCallApi = await this.callApiFromDomain(
			url,
			`${Config.GET_TX_API_EVENTS}?events=submit_proposal.proposal_id=${proposalId}`,
		);
		try {
			const initialDeposit = resultCallApi?.txs[0]?.body?.messages[0]?.initial_deposit;
			const proposerAddress = resultCallApi?.txs[0]?.body?.messages[0]?.proposer;
			const result: any = await this.broker.call('v1.crawlValidator.find', {
				query: {
					'custom_info.chain_id': Config.CHAIN_ID,
					account_address: proposerAddress,
				},
			});
			if (result && result.length > 0) {
				const nameValidator = result[0].description.moniker;
				return {
					proposalAddress: proposerAddress,
					nameValidator,
					initialDeposit,
				};
			} else {
				return {
					proposalAddress: proposerAddress,
					initialDeposit,
				};
			}
		} catch (error) {
			this.logger.error(error);
		}
		return null;
	}

	public async _start() {
		this.createJob(
			'crawl.proposal',
			{},
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
