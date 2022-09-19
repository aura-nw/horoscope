import { Context, Service, ServiceBroker } from 'moleculer';
import { dbVoteMixin } from '@Mixins/dbMixinMongoose/db-vote.mixin';

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
			},
		});
	}
}
