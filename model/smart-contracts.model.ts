/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ICodeId {
	id: number;
	creator: string;
}

export interface ISmartContracts {
	_id: ObjectIdNull;
	height: number;
	code_id: ICodeId;
	contract_name: string;
	contract_address: string;
	creator_address: string;
	contract_hash: string;
	tx_hash: string;
	num_tokens: number;
	token_info: Object;
	marketing_info: Object;
	contract_info: Object;
	msg: Object;
}

const definition: definitionType<ISmartContracts> = (collection?: string) => ({
	_id: Types.ObjectId,
	height: {
		type: Number,
		index: true,
	},
	code_id: {
		id: Number,
		creator: String,
	},
	contract_name: String,
	contract_address: {
		type: String,
		index: true,
	},
	creator_address: String,
	contract_hash: String,
	tx_hash: String,
	num_tokens: Number,
	token_info: {
		type: Object,
		default: {},
	},
	marketing_info: {
		type: Object,
		default: {},
	},
	contract_info: {
		type: Object,
		default: {},
	},
	msg: {
		type: Object,
		default: {},
	},
	custom_info: customInfoModel,
});

export const smartContractsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ISmartContracts>(definition(collection), {
		autoIndex: true,
		collection,
	});
	// @ts-ignore
	schema.index(
		{ 'custom_info.chain_id': 1, code_id: 1, contract_address: 1 },
		// @ts-ignore
		{ unique: true, name: 'unique_contract' },
	);
	return models[collection] || model(collection, schema);
};
