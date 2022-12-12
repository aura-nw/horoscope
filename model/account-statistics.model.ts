/* eslint-disable camelcase */
import { IAccountStatistics } from 'entities';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType } from 'types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IAccountStatistics> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	per_day: [
		{
			total_sent_tx: {
				amount: Number,
				percentage: Number,
			},
			total_received_tx: {
				amount: Number,
				percentage: Number,
			},
			total_sent_amount: {
				amount: Number,
				percentage: Number,
			},
			total_received_amount: {
				amount: Number,
				percentage: Number,
			},
		},
	],
	one_day: {
		total_sent_tx: {
			amount: Number,
			percentage: Number,
		},
		total_received_tx: {
			amount: Number,
			percentage: Number,
		},
		total_sent_amount: {
			amount: Number,
			percentage: Number,
		},
		total_received_amount: {
			amount: Number,
			percentage: Number,
		},
	},
	three_days: {
		total_sent_tx: {
			amount: Number,
			percentage: Number,
		},
		total_received_tx: {
			amount: Number,
			percentage: Number,
		},
		total_sent_amount: {
			amount: Number,
			percentage: Number,
		},
		total_received_amount: {
			amount: Number,
			percentage: Number,
		},
	},
	seven_days: {
		total_sent_tx: {
			amount: Number,
			percentage: Number,
		},
		total_received_tx: {
			amount: Number,
			percentage: Number,
		},
		total_sent_amount: {
			amount: Number,
			percentage: Number,
		},
		total_received_amount: {
			amount: Number,
			percentage: Number,
		},
	},
	custom_info: customInfoModel,
});

export const accountStatisticsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// Strict: false,
		collection,
	});
	// @ts-ignore
	schema.index({ address: 1, 'custom_info.chain_id': 1 }, { unique: true });
	return models[collection] || model(collection, schema);
};
