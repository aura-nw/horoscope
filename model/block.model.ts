import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface IBlockIdPart {
	total: number;
	hash: string;
}
export interface IBlockId {
	hash: String;
	parts: IBlockIdPart;
}
export interface IBlockHeaderVersion {
	block: String;
}
export interface IBlockHeader {
	version: IBlockHeaderVersion;
	chain_id: String;
	height: String;
	time: String;
	last_block_id: IBlockId;
	last_commit_hash: String;
	data_hash: String;
	validators_hash: String;
	next_validators_hash: String;
	consensus_hash: String;
	app_hash: String;
	last_results_hash: String;
	evidence_hash: String;
	proposer_address: String;
}

export interface IData {
	txs: String[];
}
export interface IEvidenceDetail {
	evidence: String[];
}
export interface IEvidence {
	evidence: IEvidenceDetail;
}

export interface ISignature {
	block_id_flag: number;
	validator_address: String;
	timestamp: String;
	signature: String;
}
export interface ILastCommit {
	height: String;
	round: number;
	block_id: IBlockId;
	signature: ISignature[];
}
export interface IBlockDetail {
	header: IBlockHeader;
	data: IData;
	evidence: IEvidence;
	last_commit: ILastCommit;
}

export interface IBlock {
	_id: ObjectIdNull;
	block_id: IBlockId;
	block: IBlockDetail;
}

const definition: definitionType<IBlock> = (collection?: string) => ({
	_id: Types.ObjectId,
	block_id: {
		hash: String,
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
			height: String,
			time: String,
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
			proposer_address: String,
		},
		data: {
			txs: [String],
		},
		evidence: {
			evidence: [String],
		},
		last_commit: {
			height: String,
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
	return models[collection] || model(collection, schema);
};
