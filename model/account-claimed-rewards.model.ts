import { IAccountClaimedRewards } from 'entities/account-claimed-rewards.entity';
import { IAccountSpendableBalances } from 'entities/account-spendable-balances.entity';
import { model, models, Types, Schema } from 'mongoose';
import { definitionType } from 'types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IAccountClaimedRewards> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	validator_reward: [
		{
			validator_address: String,
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

export const accountClaimedRewardsMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountSpendableBalances>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	schema.index({ 'custom_info.chain_id': 1, address: 1, 'validatorReward.validatorAddress': 1 });
	return models[collection] || model(collection, schema);
};
