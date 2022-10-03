import { model, models, Types } from 'mongoose';
import { definitionType } from 'types';
import { IVote } from 'entities/vote.entity';
import { customInfoModel } from './custom-info.model';
const mongoose = require('mongoose');

const definition: definitionType<IVote> = (collection?: string) => ({
	_id: Types.ObjectId,
	voter_address: String,
	proposal_id: Number,
	answer: String,
	txhash: String,
	timestamp: Date,
	height: Number,
	custom_info: customInfoModel,
});

export const voteMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new mongoose.Schema<IVote>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	schema.index({ 'custom_info.chain_id': 1, proposal_id: -1, answer: 1 });
	schema.index({ 'custom_info.chain_id': 1, proposal_id: -1 });
	schema.index({ 'custom_info.chain_id': 1, proposal_id: -1, timestamp: -1 });
	return models[collection] || model(collection, schema);
};
