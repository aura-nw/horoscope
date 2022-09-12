import CallApiMixin from '@Mixins/callApi/call-api.mixin';
import { dbVoteMixin } from '@Mixins/dbMixinMongoose/db-vote.mixin';
import { Job } from 'bull';
const QueueService = require('moleculer-bull');
import { Config } from 'common';
import { VOTE_MANAGER_ACTION } from 'common/constant';
import { VoteEntity } from 'entities/vote.entity';
import { JsonConvert } from 'json2typescript';
import { Service, ServiceBroker } from 'moleculer';

export default class VoteHandlerService extends Service {
	private callApiMixin = new CallApiMixin().start();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'vote-handler',
			version: 1,
			mixins: [
				dbVoteMixin,
				this.callApiMixin,
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'proposal.vote',
					},
				),
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
			events: {
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'proposal.vote',
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

	async handleJob(listTx: any) {
		for (const tx of listTx) {
			if (
				tx.tx_response.logs[0]?.events[0]?.attributes[0]?.value !==
				'/cosmos.gov.v1beta1.MsgVote'
			)
				continue;
			const voteMsg = tx.tx_response.tx.body.messages[0];
			const proposal_id = Number(voteMsg.proposal_id);
			const answer = voteMsg.option;
			const voter_address = voteMsg.voter;
			const txhash = tx.tx_response.txhash;
			const timestamp = tx.tx_response.timestamp;
			const height = tx.tx_response.height;
			const vote = {
				voter_address,
				proposal_id,
				answer,
				txhash,
				timestamp,
				height,
			};
			const voteEntity: VoteEntity = new JsonConvert().deserializeObject(vote, VoteEntity);
			this.broker.call(VOTE_MANAGER_ACTION.INSERT, voteEntity);
		}
	}
}
