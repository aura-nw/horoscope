import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../../types';
import { EpochInfoSDKType } from 'osmojs/types/codegen/osmosis/epochs/genesis';

const definition: definitionType<EpochInfoSDKType> = (collection?: string) => ({
	_id: Types.ObjectId,
	identifier: String,
	start_time: Date,
	duration: String,
	current_epoch: Number,
	current_epoch_start_time: Date,
	epoch_counting_started: Boolean,
	current_epoch_start_height: Number,
});

export const epochMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};
