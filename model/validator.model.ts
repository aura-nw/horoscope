import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface IConsensusPubkey {
	'@type': String;
	key: String;
}

export interface IDescription {
	moniker: String;
	identity: String;
	website: String;
	details: String;
	security_contact: String;
}

export interface ICommissionRate {
	rate: String;
	max_rate: String;
	max_change_rate: String;
}

export interface ICommission {
	commision_rates: ICommissionRate;
	update_time: String;
}

export interface IValidator {
	_id: ObjectIdNull;
	operator_address: String;
	consensus_pubkey: IConsensusPubkey;
	jailed: Boolean;
	status: String;
	tokens: String;
	delegator_shares: String;
	description: IDescription;
	unbonding_height: String;
	unbonding_time: String;
	commission: ICommission;
	min_self_delegation: String;
}

const definition: definitionType<IValidator> = (collection?: string) => ({
	_id: Types.ObjectId,
	operator_address: String,
	consensus_pubkey: {
		'@type': String,
		key: String,
	},
	jailed: Boolean,
	status: String,
	tokens: String,
	delegator_shares: String,
	description: {
		moniker: String,
		identity: String,
		website: String,
		details: String,
		security_contact: String,
	},
	unbonding_height: String,
	unbonding_time: String,
	commission: {
		commision_rates: {
			rate: String,
			max_rate: String,
			max_change_rate: String,
		},
		update_time: String,
	},
	min_self_delegation: String,
	custom_info: customInfoModel,
});

export const validatorMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	// const schema = new Schema({}, { autoIndex: true, strict: false, collection: collection });
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		collection: collection,
	});
	return models[collection] || model(collection, schema);
};
