import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface IPoolDetail {
	not_bonded_tokens: String;
	bonded_tokens: String;
}
export interface IPool {
	_id: ObjectIdNull;
	pool: IPoolDetail;
}

const definition: definitionType<IPool> = (collection?: string) => ({
	_id: Types.ObjectId,
	pool: {
		not_bonded_tokens: String,
		bonded_tokens: String,
	},
	not_bonded_tokens: String,
	bonded_tokens: String,
	custom_info: customInfoModel,
});

export const poolMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};