import { MEDIA_STATUS } from '../common/constant';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';

export interface ICW4973Media {
	_id: ObjectIdNull;
	key: String;
	media_link: String;
	status: String;
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
		collection: collection,
		timestamps: {
			createdAt: true,
			updatedAt: true,
		},
		// strict: true
	});
	return models[collection] || model(collection, schema);
};
