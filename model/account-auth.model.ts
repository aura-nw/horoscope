import { IAccountAuth } from "entities/account-auth.entity";
import { model, models, Types, Schema } from "mongoose";
import { definitionType } from "types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IAccountAuth> = (collection?: string) => ({
	_id: Types.ObjectId,
	address: String,
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
	custom_info: {
		chain_id: String,
		chain_name: String,
	},
});

export const accountAuthMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IAccountAuth>(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};