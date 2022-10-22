import { IDailyTxStatistics } from "entities";
import { model, models, Schema, Types } from 'mongoose';
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IDailyTxStatistics> = (collection?: string) => ({
	_id: Types.ObjectId,
    daily_txs: Number,
    daily_active_addresses: Number,
    unique_addresses: Number,
    date: Date,
	custom_info: customInfoModel,
});

export const dailyTxStatisticsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// strict: false,
		collection: collection,
	});
    // @ts-ignore
	schema.index({ 'date': 1, 'custom_info.chain_id': 1 }, { unique: true });
	return models[collection] || model(collection, schema);
};