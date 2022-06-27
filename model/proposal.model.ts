import { IProposal } from 'entities';
import { Long } from 'mongodb';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IProposal> = (collection?: string) => ({
	_id: Types.ObjectId,
	proposal_id: {
		type: Number,
		index: true,
		unique: true,
	},
	content: {
		'@type': String,
		title: String,
		description: String,
		changes: [
			{
				subspace: String,
				key: String,
				value: String,
			},
		],
	},
	status: String,
	tally: {
		yes: String,
		no: String,
		abstain: String,
		no_with_veto: String,
	},
	final_tally_result: {
		yes: String,
		no: String,
		abstain: String,
		no_with_veto: String,
	},
	submit_time: Date,
	deposit_end_time: Date,
	total_deposit: [
		{
			denom: String,
			amount: String,
		},
	],
	voting_start_time: Date,
	voting_end_time: Date,
	custom_info: customInfoModel,
});

export const proposalMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IProposal>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};
