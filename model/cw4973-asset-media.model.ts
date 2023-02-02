/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { ICW4973Media } from '../entities/cw4973-media-link.entity';
import { MEDIA_STATUS } from '../common/constant';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<ICW4973Media> = (collection?: string) => ({
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

export const cw4973MediaMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW4973Media>(definition(collection), {
		autoIndex: true,
		collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// Strict: true
	});
	return models[collection] || model(collection, schema);
};
