import { IAccountInfo } from "entities/account-info.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";

const definition: definitionType<IAccountInfo> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	account_auth: {
		height: String,
		result: {
			type: { type: String },
			value: Object,
		}
	},
	account_balances: [
		{
			denom: String,
			minimal_denom: String,
			amount: String,
		},
	],
	account_delegations: [
		{
			delegation: {
				delegator_address: String,
				validator_address: {
					type: String,
					index: true,
				},
				shares: String,
			},
			balance: {
				denom: String,
				amount: String,
			},
		},
	],
	account_redelegations: [
		{
			redelegation: {
				delegator_address: String,
				validator_src_address: String,
				validator_dst_address: String,
				entries: [
					{
						creation_height: String,
						completion_time: String,
						initial_balance: String,
						shares_dst: String,
					},
				],
			},
			entries: [
				{
					redelegation_entry: {
						creation_height: String,
						completion_time: Date,
						initial_balance: String,
						shares_dst: String,
					},
					balance: String,
				},
			],
		},
	],
	account_spendable_balances: [
		{
			denom: String,
			minimal_denom: String,
			amount: String,
		},
	],
	account_unbonding: [
		{
			delegator_address: String,
			validator_address: String,
			validator_description: {
				moniker: String,
				identity: String,
				website: String,
				details: String,
				security_contact: String,
			},
			entries: [
				{
					creation_height: String,
					completion_time: Date,
					initial_balance: String,
					balance: String,
				},
			],
		},
	],
	account_claimed_rewards: [
		{
			validator_address: String,
			denom: String,
			amount: String,
		},
	],
	custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const accountInfoMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountInfo>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	// @ts-ignore
	schema.index({ 'address': 1, 'custom_info.chain_id': 1 }, { unique: true });
	return models[collection] || model(collection, schema);
};