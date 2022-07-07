import { IAccountRedelegations } from "entities/account-redelegations.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IAccountRedelegations> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
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
	custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const accountRedelegationsMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountRedelegations>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	schema.index({ 'address': 1, 'custom_info.chain_id': 1 });
	return models[collection] || model(collection, schema);
};