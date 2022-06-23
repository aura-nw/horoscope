import { IAccountInfo } from "entities/account-info.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";

const definition: definitionType<IAccountInfo> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	balances: [
		{
			denom: String,
			amount: String,
		},
	],
	delegation_responses: [
		{
			delegation: {
				delegator_address: String,
				validator_address: String,
				shares: String,
			},
			balance: {
				denom: String,
				amount: String,
			},
		},
	],
	redelegation_responses: [
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
						completion_time: String,
						initial_balance: String,
						shares_dst: String,
					},
					balance: String,
				},
			],
		},
	],
	unbonding_responses: [
		{
			delegator_address: String,
			validator_address: String,
			entries: [
				{
					creation_height: String,
					completion_time: String,
					initial_balance: String,
					balance: String,
				},
			],
		},
	],
	account: {
		height: String,
		result: {
			type: { type: String },
			value: {
				address: String,
				public_key: {
					type: { type: String },
					value: String,
				},
				account_number: String,
				sequence: String,
			}
		}
	},
	spendable_balances: [
		{
			denom: String,
			amount: String,
		},
	],
});

export const accountInfoMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountInfo>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};