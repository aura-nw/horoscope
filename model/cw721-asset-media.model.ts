import { ICW721Media } from '../entities/cw721-media-link.entity';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export enum MediaStatus {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	ERROR = 'ERROR',
	HANDLING = 'HANDLING',
}

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
	status: {
		type: String,
		enum: MediaStatus,
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
		collection: collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// strict: true
	});
	schema.index({ updatedAt: -1 });
	//@ts-ignore
	schema.index({ 'metadata.image': 1 }, { name: 'metadata_image_asc', sparse: true });
	//@ts-ignore
	schema.index({ 'metadata.animation_url': 1 }, { name: 'metadata_image_asc', sparse: true });
	return models[collection] || model(collection, schema);
};
