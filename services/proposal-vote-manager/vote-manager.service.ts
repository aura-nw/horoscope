// import { VoteEntity } from 'entities/vote.entity';
import { VoteEntity } from '../../entities/vote.entity';
import { Context, Service, ServiceBroker } from 'moleculer';
import { dbVoteMixin } from './../../mixins/dbMixinMongoose/db-vote.mixin';
import { CountVoteParams, CountVoteResponse } from '../../types';

export default class VoteHandlerService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'proposal-vote-manager',
			mixins: [dbVoteMixin],
			version: 1,
			actions: {
				'act-insert': {
					async handler(ctx: Context): Promise<any> {
						// @ts-ignore
						this.logger.debug(
							`ctx.params proposal-vote-manager insert ${JSON.stringify(ctx.params)}`,
						);
						// @ts-ignore
						const result = await this.adapter.insertMany(ctx.params);
						return result;
					},
				},
				'act-insert-on-duplicate-update': {
					async handler(ctx: Context<VoteEntity>): Promise<any> {
						// @ts-ignore
						this.logger.debug(
							`ctx.params proposal-vote-manager find ${JSON.stringify(ctx.params)}`,
						);
						const newVote = ctx.params;

						// @ts-ignore
						const existVote = await this.adapter.find({
							query: {
								proposal_id: newVote.proposal_id,
								voter_address: newVote.voter_address,
							},
						});
						let result;
						if (existVote.length > 0) {
							existVote[0].answer = newVote.answer;
							existVote[0].txhash = newVote.txhash;
							existVote[0].timestamp = newVote.timestamp;
							result = await this.adapter.updateById(existVote[0]._id, existVote[0]);
							this.logger.debug(`updatedVote ${JSON.stringify(result)}`);
						} else {
							result = await this.adapter.insertMany(newVote);
							this.logger.debug(`result ${JSON.stringify(result)}`);
						}
						return result;
					},
				},
				'act-find-smallest-id': {
					async handler(ctx: Context): Promise<string> {
						// @ts-ignore
						this.logger.debug(
							`ctx.params proposal-vote-manager find smallest id ${JSON.stringify(
								ctx.params,
							)}`,
						);

						// @ts-ignore
						const smallestVote = await this.adapter.findOne(undefined, undefined, {
							sort: '_id',
						});

						return smallestVote?._id.toString();
					},
				},
				'act-count-votes': {
					async handler(ctx: Context<CountVoteParams>): Promise<CountVoteResponse[]> {
						// @ts-ignore
						this.logger.debug(
							`ctx.params proposal-vote-manager count votes ${JSON.stringify(
								ctx.params,
							)}`,
						);

						const { chain_id, proposal_id } = ctx.params;

						// @ts-ignore
						const data = await this.adapter.aggregate([
							{
								$match: {
									proposal_id,
								},
							},
							{
								$group: {
									_id: {
										answer: '$answer',
									},
									count: {
										$sum: 1,
									},
								},
							},
						]);
						const countVoteResult = [];
						for (const item of data) {
							const countVoteType: CountVoteResponse = {
								answer: item._id.answer,
								count: item.count,
							};
							countVoteResult.push(countVoteType);
						}
						console.log(countVoteResult);

						return countVoteResult;
					},
				},
			},
		});
	}
}
