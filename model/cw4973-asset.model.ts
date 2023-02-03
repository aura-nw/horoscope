/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { ICW4973Asset } from '../entities/cw4973-asset.entity';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

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
	metadata: Object,
	image: {
		link_s3: {
			type: String,
			index: true,
		},
		content_type: String,
		file_path: String,
	},
	animation: {
		link_s3: {
			type: String,
			index: true,
		},
		content_type: String,
		file_path: String,
	},
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
