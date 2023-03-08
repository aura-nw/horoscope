/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { IBlock } from '../entities';
import { definitionType } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IBlock> = (collection?: string) => ({
	_id: Types.ObjectId,
	block_id: {
		hash: { type: String, index: true, unique: true },
		parts: {
			total: Number,
			hash: String,
		},
	},
	block: {
		header: {
			version: {
				block: Number,
			},
			chain_id: String,
			height: { type: Number, index: -1 },
			time: Date,
			last_block_id: {
				hash: String,
				parts: {
					total: Number,
					hash: String,
				},
			},
			last_commit_hash: String,
			data_hash: String,
			validators_hash: String,
			next_validators_hash: String,
			consensus_hash: String,
			app_hash: String,
			last_results_hash: String,
			evidence_hash: String,
			proposer_address: { type: String, index: true },
		},
		data: {
			txs: [String],
		},
		evidence: {
			evidence: [Object],
		},
		last_commit: {
			height: Number,
			round: Number,
			block_id: {
				hash: String,
				parts: {
					total: Number,
					hash: String,
				},
			},
			signatures: [
				{
					block_id_flag: Number,
					validator_address: String,
					timestamp: String,
					signature: String,
				},
			],
		},
	},
	validator_name: String,
	operator_address: String,
	custom_info: customInfoModel,
});

export const blockMongoModel = (collection: string): unknown => {
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
