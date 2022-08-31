import { IAccountTotalRewards } from '../entities';
import { IAccountSpendableBalances } from 'entities/account-spendable-balances.entity';
import { model, models, Types, Schema } from 'mongoose';
import { definitionType } from 'types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IAccountTotalRewards> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	validatorReward: [
		{
			validatorAddress: String,
			rewards: [
				{
					denom: String,
					amount: String,
				},
			],
		},
	],
	custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const accountTotalRewardsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountSpendableBalances>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	schema.index({ 'custom_info.chain_id': 1, address: 1, 'validatorReward.validatorAddress': 1 });
	return models[collection] || model(collection, schema);
};
