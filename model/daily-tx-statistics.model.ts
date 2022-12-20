/* eslint-disable camelcase */
import { IDailyTxStatistics } from 'entities';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType } from 'types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IDailyTxStatistics> = (collection?: string) => ({
	_id: Types.ObjectId,
	daily_txs: Number,
	daily_active_addresses: Number,
	unique_addresses: Number,
	unique_addresses_increase: Number,
	date: {
		type: Date,
		index: true,
		unique: true,
	},
	custom_info: customInfoModel,
});

export const dailyTxStatisticsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// Strict: false,
		collection,
	});
	return models[collection] || model(collection, schema);
};
