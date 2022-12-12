/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { IPool } from '../entities';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IPool> = (collection?: string) => ({
	_id: Types.ObjectId,
	not_bonded_tokens: String,
	bonded_tokens: String,
	custom_info: customInfoModel,
});

export const poolMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
