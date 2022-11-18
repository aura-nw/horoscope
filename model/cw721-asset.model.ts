import { ICW721Asset } from '../entities/cw721-asset.entity';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

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
		type: [Object],
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
	},
	animation: {
		link_s3: {
			type: String,
			index: true,
		},
		content_type: String,
	},
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
	schema.index({ updatedAt: -1 });
	return models[collection] || model(collection, schema);
};
