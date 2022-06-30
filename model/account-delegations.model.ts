import { IAccountDelegations } from "entities/account-delegations.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IAccountDelegations> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
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
	custom_info: customInfoModel,
});

export const accountDelegationsMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountDelegations>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};