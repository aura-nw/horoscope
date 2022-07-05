import { uniqueId } from 'lodash';
import { model, models, Schema, Types } from 'mongoose';
import { type } from 'os';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface IAsset {
	_id: ObjectIdNull;
	asset_id: String;
	code_id: String;
	asset_info: Object;
	constract_address: String;
	token_id: String;
	owner: String;
	history: String[];
}

const definition: definitionType<IAsset> = (collection?: string) => ({
	_id: Types.ObjectId,
	asset_id: {
		type: String, unique : true, index: true
	},
	code_id: String,
	asset_info: {
		data: {
			access: {
				owner: String,
				approvals: []
			},
			info: {
				token_uri: String,
				extension: {}
			}
		}
	},
	constract_address: String,
	token_id: String,
	owner: {
		type: String, index: true
	},
	history: {
		type: [String]
	},
	custom_info: customInfoModel,
})


export const assetMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAsset>(definition(collection), {
		autoIndex: true,
		collection: collection,
		timestamps:{
			createdAt: true,
			updatedAt: true
		}
		// strict: true
	});
	return models[collection] || model(collection, schema);
};
