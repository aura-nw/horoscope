import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';

export const blockMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema({}, { autoIndex: true, strict: false, collection: collection });
	return models[collection] || model(collection, schema);
};
