/* eslint-disable camelcase */
import { model, models, Schema, Types } from 'mongoose';
import { definitionType } from 'types';
import { customInfoModel } from './custom-info.model';

export interface IDailyCw20Holder {
	_id: Types.ObjectId | string | null;
	code_id: number;
	contract_address: string;
	old_holders: number;
	new_holders: number;
	change_percent: number;
}

const definition: definitionType<IDailyCw20Holder> = (collection?: string) => ({
	_id: Types.ObjectId,
	code_id: Number,
	contract_address: String,
	old_holders: Number,
	new_holders: Number,
	change_percent: Number,
	custom_info: customInfoModel,
});

export const dailyCw20HolderMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// Strict: false,
		collection,
	});
	// @ts-ignore
	schema.index({ code_id: 1, contract_address: 1 }, { unique: true });
	return models[collection] || model(collection, schema);
};
