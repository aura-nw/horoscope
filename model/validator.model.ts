import { IValidator } from '../entities';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<IValidator> = (collection?: string) => ({
	_id: Types.ObjectId,
	operator_address: { type: String, index: true },
	consensus_pubkey: {
		'@type': String,
		key: String,
	},
	consensus_hex_address: String,
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
		commission_rates: {
			rate: String,
			max_rate: String,
			max_change_rate: String,
		},
		update_time: String,
	},
	min_self_delegation: String,
	val_signing_info: {
		address: { type: String, index: true },
		start_height: String,
		index_offset: String,
		jailed_until: String,
		tombstoned: Boolean,
		missed_blocks_counter: String,
	},
	self_delegation_balance: {
		denom: String,
		amount: String,
	},
	uptime: Number,
	account_address: String,
	percent_voting_power: { type: Number, index: true },
	number_delegators: Number,
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
	schema.index({ operator_address: 1, 'custom_info.chain_id': 1 });
	schema.index({ account_address: 1, 'custom_info.chain_id': 1 });
	schema.index({ consensus_hex_address: 1, 'custom_info.chain_id': 1 });
	return models[collection] || model(collection, schema);
};
