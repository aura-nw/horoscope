import { IBlock } from '../entities';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';
import { NumericConverter } from '../entities/converters/numeric.converter';

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
			height: { type: Number, index: true },
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
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// const schema = new Schema({}, { autoIndex: true, strict: false, collection: collection });
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	// schema.index({ 'block.header.height': -1, 'custom_info.chain_id': 1 });
	return models[collection] || model(collection, schema);
};
