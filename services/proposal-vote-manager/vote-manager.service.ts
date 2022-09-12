import { Context, Service, ServiceBroker } from 'moleculer';
import { dbVoteMixin } from '@Mixins/dbMixinMongoose/db-vote.mixin';
import CallApiMixin from '@Mixins/callApi/call-api.mixin';

export default class VoteHandlerService extends Service {
	private callApiMixin = new CallApiMixin().start();

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
						return await this.adapter.insert(ctx.params);
					},
				},
			},
		});
	}
}
