import { IAccountBalances } from "entities/account-balances.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IAccountBalances> = (collection?: string) => ({
    _id: Types.ObjectId,
    address: String,
    balances: [
		{
			denom: String,
			amount: String,
		},
	],
    custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const accountBalancesMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountBalances>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	schema.index({ 'address': 1, 'custom_info.chain_id': 1 });
	return models[collection] || model(collection, schema);
};