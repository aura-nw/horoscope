import { model, models, Schema, Types } from "mongoose";
import { IFeegrant } from "../entities/feegrant.entity";
import { definitionType } from "../types";
import { customInfoModel } from "./custom-info.model";

const definition: definitionType<IFeegrant> = (collection?: string) => ({
    _id: Types.ObjectId,
    tx_hash: String,
    origin_feegrant_txhash: String,
    granter: String,
    grantee: String,
    result: Boolean,
    type: String,
    timestamp: Date,
    spend_limit: {
        amount: String,
        denom: String
    },
    expiration: Date,
    expired: Boolean,
    amount: {
        amount: String,
        denom: String
    },
    status: String,
    custom_info: customInfoModel,
    action: String,
    origin_revoke_txhash: String
});

export const feegrantMongoModel = (collection: string): unknown => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // const schema = new Schema({}, { autoIndex: true, strict: false, collection: collection });
    const schema = new Schema(definition(collection), {
        autoIndex: true,
        collection: collection,
    });
    // @ts-ignore
    schema.index({ 'tx_hash': 1, 'action': 1, 'status': 1 }, { unique: true });
    return models[collection] || model(collection, schema);
};