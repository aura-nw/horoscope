import { IAccountSpendableBalances } from "entities/account-spendable-balances.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IAccountSpendableBalances> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
	spendable_balances: [
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

export const accountSpendableBalancesMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountSpendableBalances>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};