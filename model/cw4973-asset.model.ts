/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ICW4973Asset {
	_id: ObjectIdNull;
	asset_id: string;
	code_id: string;
	// eslint-disable-next-line @typescript-eslint/ban-types
	asset_info: Object;
	contract_address: string;
	token_id: string;
	owner: string;
	media_link: string;
	history: string[];
	is_burned: boolean;
}

const definition: definitionType<ICW4973Asset> = (collection?: string) => ({
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
	media_link: String,
	custom_info: customInfoModel,
	is_burned: Boolean,
});

export const cw4973AssetMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW721Asset>(definition(collection), {
		autoIndex: true,
		collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// Strict: true
	});
	schema.index({ 'custom_info.chain_id': 1, asset_id: 1 });
	return models[collection] || model(collection, schema);
};
