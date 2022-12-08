/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ICW20Asset {
	_id: ObjectIdNull;
	asset_id: string;
	code_id: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	asset_info: Object;
	contract_address: string;
	token_id: string;
	owner: string;
	balance: string;
	history: string[];
}

const definition: definitionType<ICW20Asset> = (collection?: string) => ({
	_id: Types.ObjectId,
	asset_id: {
		type: String,
		unique: true,
		index: true,
	},
	code_id: String,
	asset_info: {
		data: {
			name: String,
			symbol: String,
			decimals: Number,
			total_supply: String,
		},
	},
	contract_address: String,
	token_id: String,
	balance: String,
	owner: {
		type: String,
		index: true,
	},
	history: {
		type: [String],
	},
	percent_hold: {
		type: Number,
	},
	custom_info: customInfoModel,
});

export const cw20AssetMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW20Asset>(definition(collection), {
		autoIndex: true,
		collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// Strict: true
	});
	schema.index({ 'custom_info.chain_id': 1, asset_id: 1 });
	schema.index({ updatedAt: -1 });
	return models[collection] || model(collection, schema);
};
