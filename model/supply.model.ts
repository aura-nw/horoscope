/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { ISupply } from '../entities/supply.entity';
import { definitionType } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<ISupply> = (collection?: string) => ({
	_id: Types.ObjectId,
	supply: [
		{
			amount: String,
			denom: String,
		},
	],
	custom_info: customInfoModel,
});

export const supplyMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// Const schema = new Schema({}, { autoIndex: true, strict: false, collection: collection });
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
