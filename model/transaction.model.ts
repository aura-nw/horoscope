import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ITransaction {
	_id: ObjectIdNull;
	hash: String;
	height: String;
	index: Number;
	tx_result: Object;
	tx: String;
}

const definition: definitionType<ITransaction> = (collection?: string) => ({
	_id: Types.ObjectId,
	hash: String,
	height: String,
	index: Number,
	tx_result: {
		code: Number,
		data: String,
		log: String,
		info: String,
		gas_wanted: String,
		gas_used: String,
		events: [
			{
				type: { type: String },
				attributes: [
					{
						key: String,
						value: String,
						index: Boolean,
					},
				],
			},
		],
		codespace: String,
	},
	tx: String,
	custom_info: customInfoModel,
});

export const transactionMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// strict: false,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};
