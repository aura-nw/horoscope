/* eslint-disable camelcase */
import { model, models, Types, Schema } from 'mongoose';
import { definitionType } from 'types';
import { IDelayJob } from '../entities/delay-job.entity';

const definition: definitionType<IDelayJob> = (collection?: string) => ({
	_id: Types.ObjectId,
	content: Object,
	type: { type: String },
	expire_time: Date,
	indexes: {
		type: String,
		index: true,
		unique: true,
	},
	custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const delayJobMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IDelayJob>(definition(collection), {
		autoIndex: true,
		collection,
	});
	return models[collection] || model(collection, schema);
};
