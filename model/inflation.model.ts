/* eslint-disable camelcase */
import { model, models, Types, Schema } from 'mongoose';
import { definitionType } from 'types';
import { IInflation } from '../entities';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IInflation> = (collection?: string) => ({
	_id: Types.ObjectId,
	inflation: String,
	custom_info: customInfoModel,
});

export const inflationMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IInflation>(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
