/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { IParam } from '../entities';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

// Export interface IParam {
// 	_id: ObjectIdNull;
// }

const definition: definitionType<IParam> = (collection?: string) => ({
	_id: Types.ObjectId,
	module: String,
	params: {},
	custom_info: customInfoModel,
});

export const paramMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
