/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
import { Job } from 'bull';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { LIST_NETWORK, MSG_TYPE, VOTE_MANAGER_ACTION } from '../../common/constant';
import { ITransaction } from '../../entities';
import { CustomInfo } from '../../entities/custom-info.entity';
import { VoteEntity } from '../../entities/vote.entity';
import { queueConfig } from '../../config/queue';
import { dbVoteMixin } from './../../mixins/dbMixinMongoose/db-vote.mixin';
import CallApiMixin from './../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

interface ITakeVoteRequest {
	listTx: ITransaction[];
}
export default class VoteHandlerService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'vote-handler',
			version: 1,
			mixins: [
				dbVoteMixin,
				new CallApiMixin().start(),
				queueService(queueConfig.redis, queueConfig.opts),
			],
			queues: {
				'proposal.vote': {
					concurrency: parseInt(Config.CONCURRENCY_PROPOSAL_VOTE_HANDLER, 10),
					process(job: Job) {
						job.progress(10);

						// @ts-ignore
						this.handleJob(job.data.listTx, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			// Events: {
			// 	// Listen to event from tx-handler
			// 	'list-tx.upsert': {
			// 		Handler: (ctx: any) => {
			// 			// Create job to handle vote
			// 			This.createJob(
			// 				'proposal.vote',
			// 				{
			// 					ListTx: ctx.params.listTx,
			// 					ChainId: ctx.params.chainId,
			// 				},
			// 				{
			// 					RemoveOnComplete: true,
			// 					RemoveOnFail: {
			// 						Count: 3,
			// 					},
			// 				},
			// 			);
			// 			Return;
			// 		},
			// 	},
			// },
			actions: {
				// Action to take vote from tx
				'act-take-vote': {
					async handler(ctx: Context<ITakeVoteRequest>): Promise<any> {
						const { listTx } = ctx.params;
						await this.handleJob(listTx);
						return;
					},
				},
			},
		});
	}

	public async handleJob(listTx: any, chainId?: string) {
		for (const tx of listTx) {
			const listMsg = tx.tx.body.messages;
			listMsg.map((msg: any) => {
				if (msg['@type'] === MSG_TYPE.MSG_VOTE) {
					this.createVoteEntity(tx, msg, chainId);
				} else if (msg['@type'] === MSG_TYPE.MSG_EXEC) {
					const listTxExecAuthz = msg.msgs;
					listTxExecAuthz.map((msgExec: any) => {
						if (msgExec['@type'] === MSG_TYPE.MSG_VOTE) {
							this.createVoteEntity(tx, msgExec, chainId);
						}
					});
				}
			});
		}
	}

	public createVoteEntity(tx: any, msg: any, chainId?: any) {
		const chain = chainId || tx.custom_info.chain_id || Config.CHAIN_ID;
		if (!chain) {
			throw new Error('ChainId is not found');
		}

		// Create vote entity
		const proposal_id = Number(msg.proposal_id);
		const answer = msg.option;
		const voter_address = msg.voter;
		const txhash = tx.tx_response.txhash;
		const timestamp = tx.tx_response.timestamp;
		const height = Number(tx.tx_response.height);
		const code = tx.tx_response.code.toString();
		const chainInfo: CustomInfo = {
			chain_id: chain,
			chain_name: LIST_NETWORK.find((x) => x.chainId === chain)?.chainName || 'unknown',
		};
		if (code !== '0') {
			return;
		}
		const vote = {
			voter_address,
			proposal_id,
			answer,
			txhash,
			timestamp,
			height,
			custom_info: chainInfo,
			code,
		};
		this.logger.debug('vote: ', JSON.stringify(vote));
		const voteEntity: VoteEntity = new JsonConvert().deserializeObject(vote, VoteEntity);
		this.logger.info('voteEntity', JSON.stringify(voteEntity));
		// Call action to save votes
		this.broker.call(VOTE_MANAGER_ACTION.INSERT_ON_DUPLICATE_UPDATE, voteEntity);
	}

	public async _start() {
		await this.waitForServices('v1.proposal-vote-manager');
		this.getQueue('proposal.vote').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('proposal.vote').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('proposal.vote').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
