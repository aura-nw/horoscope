import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../../types';
import { PoolSDKType } from 'osmojs/types/codegen/osmosis/gamm/pool-models/balancer/balancerPool';

const definition: definitionType<PoolSDKType> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	id: Number,
	pool_params: {
		swap_fee: String,
		exit_fee: String,
		smooth_weight_change_params: Object,
	},
	future_pool_governor: String,
	total_shares: {
		denom: String,
		amount: String,
	},
	total_weight: String,
	pool_assets: [
		{
			token: {
				denom: String,
				amount: String,
			},
			weight: String,
		},
	],
});

export const gammPoolMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};
