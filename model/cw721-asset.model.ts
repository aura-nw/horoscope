import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ICW721Asset {
	_id: ObjectIdNull;
	asset_id: String;
	code_id: String;
	asset_info: Object;
	contract_address: String;
	token_id: String;
	owner: String;
	history: String[];
}

const definition: definitionType<ICW721Asset> = (collection?: string) => ({
	_id: Types.ObjectId,
	asset_id: {
		type: String,
		unique: true,
		index: true,
	},
	code_id: String,
	asset_info: {
		data: {
			access: {
				owner: String,
				approvals: [],
			},
			info: {
				token_uri: String,
				extension: {},
			},
		},
	},
	contract_address: String,
	token_id: String,
	owner: {
		type: String,
		index: true,
	},
	history: {
		type: [String],
	},
	custom_info: customInfoModel,
});

export const cw721AssetMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW721Asset>(definition(collection), {
		autoIndex: true,
		collection: collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// strict: true
	});
	schema.index({ 'custom_info.chain_id': 1, asset_id: 1 });
	return models[collection] || model(collection, schema);
};
