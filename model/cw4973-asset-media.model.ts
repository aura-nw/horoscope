/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { MEDIA_STATUS } from '../common/constant';
import { definitionType, ObjectIdNull } from '../types';

export interface ICW4973Media {
	_id: ObjectIdNull;
	key: string;
	media_link: string;
	status: string;
}

const definition: definitionType<ICW4973Media> = (collection?: string) => ({
	_id: Types.ObjectId,
	key: {
		type: String,
		unique: true,
		index: true,
	},
	media_link: String,
	status: {
		type: String,
		enum: MEDIA_STATUS,
	},
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
