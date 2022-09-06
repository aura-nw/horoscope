import { IDelayJob } from "../entities/delay-job.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";

const definition: definitionType<IDelayJob> = (collection?: string) => ({
	_id: Types.ObjectId,
	content: Object,
	type: { type: String },
    expire_time: Date,
	status: String,
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
		collection: collection,
	});
	schema.index({ 'content.address': 1, 'type': 1, 'expire_time': 1, 'custom_info.chain_id': 1 });
	return models[collection] || model(collection, schema);
};