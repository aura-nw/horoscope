import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';

export interface IParam {
	_id: ObjectIdNull;
}

const definition: definitionType<IParam> = (collection?: string) => ({
	_id: Types.ObjectId,
	// type: String,
	// params: Object,
	// paramBank: {
	// 	send_enabled: [
	// 		{
	// 			denom: String,
	// 			enabled: Boolean,
	// 		},
	// 	],
	// },
	// paramDistribution: {
	// 	community_tax: String,
	// 	base_proposer_reward: String,
	// 	bonus_proposer_reward: String,
	// 	withdraw_addr_enabled: Boolean,
	// },
	// paramGovVoting: {
	// 	voting_params: {
	// 		voting_period: String,
	// 	},
	// 	deposit_params: {
	// 		min_deposit: [
	// 			{
	// 				denom: String,
	// 				amount: String,
	// 			},
	// 		],
	// 		max_deposit_period: String,
	// 	},
	// 	tally_params: {
	// 		quorum: String,
	// 		threshold: String,
	// 		veto_threshold: String,
	// 	},
	// },
	// paramSlashing: {
	// 	signed_blocks_window: String,
	// 	min_signed_per_window: String,
	// 	downtime_jail_duration: String,
	// 	slash_fraction_double_sign: String,
	// 	slash_fraction_downtime: String,
	// },
	// paramStaking: {
	// 	unbonding_time: String,
	// 	max_validators: Number,
	// 	max_entries: Number,
	// 	historicalEntries: Number,
	// 	bond_denom: String,
	// },
	// paramIbcTransfer: {
	// 	send_enabled: Boolean,
	// 	receive_enabled: Boolean,
	// },
});

export const paramMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(
		{},
		{
			autoIndex: true,
			collection: collection,
			strict: false,
		},
	);
	return models[collection] || model(collection, schema);
};
