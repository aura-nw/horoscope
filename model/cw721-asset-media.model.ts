/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { ICW721Media } from '../entities/cw721-media-link.entity';
import { definitionType, ObjectIdNull } from '../types';
import { MEDIA_STATUS } from '../common/constant';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<ICW721Media> = (collection?: string) => ({
	_id: Types.ObjectId,
	key: {
		type: String,
		unique: true,
		index: true,
	},
	source: {
		type: String,
		index: true,
	},
	media_link: String,
	file_path: String,
	status: {
		type: String,
		enum: MEDIA_STATUS,
	},
	content_type: String,
	custom_info: customInfoModel,
	metadata: Object,
});

export const cw721MediaMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW721Media>(definition(collection), {
		autoIndex: true,
		collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// Strict: true
	});
	schema.index({ updatedAt: -1 });
	// @ts-ignore
	schema.index({ 'metadata.image': 1 }, { name: 'metadata_image_asc', sparse: true });
	// @ts-ignore
	schema.index({ 'metadata.animation_url': 1 }, { name: 'metadata_image_asc', sparse: true });
	return models[collection] || model(collection, schema);
};
