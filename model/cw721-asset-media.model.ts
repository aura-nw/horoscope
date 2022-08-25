import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';

export interface ICW721Media {
	_id: ObjectIdNull;
	key: String;
	media_link: String,
	status: String,
}

export enum MediaStatus {
	PENDING = "PENDING",
	COMPLETED = "COMPLETED",
	ERROR = "ERROR",
	HANDLING = "HANDLING",
}

const definition: definitionType<ICW721Media> = (collection?: string) => ({
	_id: Types.ObjectId,
	key: {
		type: String, unique: true, index: true
	},
	media_link: String,
	status: {
		type: String,
		enum: MediaStatus
	},
})


export const cw721MediaMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICW721Media>(definition(collection), {
		autoIndex: true,
		collection: collection,
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
		// strict: true
	});
	return models[collection] || model(collection, schema);
};
