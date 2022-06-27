import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';

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

@JsonObject('ConsensusPubkey')
export class ConsensusPubkey implements IConsensusPubkey {
	@JsonProperty('@type', String)
	'@type': String = '';
	@JsonProperty('key', String)
	key: String = '';
}

@JsonObject('description')
export class Description implements IDescription {
	@JsonProperty('moniker', String)
	moniker: String = '';
	@JsonProperty('identity', String)
	identity: String = '';
	@JsonProperty('website', String)
	website: String = '';
	@JsonProperty('details', String)
	details: String = '';
	@JsonProperty('security_contact', String)
	security_contact: String = '';
}

@JsonObject('CommissionRate')
export class CommissionRate implements ICommissionRate {
	@JsonProperty('rate', String)
	rate: String = '';
	@JsonProperty('max_rate', String)
	max_rate: String = '';
	@JsonProperty('max_change_rate', String)
	max_change_rate: String = '';
}

@JsonObject('Commission')
export class Commission implements ICommission {
	@JsonProperty('commission_rates', CommissionRate)
	commision_rates: CommissionRate = {} as CommissionRate;
	@JsonProperty('update_time', String)
	update_time: String = '';
}

@JsonObject('Validator')
export class ValidatorEntity implements IValidator {
	@JsonProperty('_id', String, true)
	public _id = Config.DB_PRODUCT.dialect === 'local' ? Types.ObjectId() : null;

	@JsonProperty('operator_address', String)
	public operator_address: String = '';

	@JsonProperty('consensus_pubkey', ConsensusPubkey)
	public consensus_pubkey: ConsensusPubkey = {} as ConsensusPubkey;

	@JsonProperty('jailed', Boolean)
	public jailed: Boolean = false;

	@JsonProperty('status', String)
	public status: String = '';

	@JsonProperty('tokens', String)
	public tokens: String = '';

	@JsonProperty('delegator_shares', String)
	public delegator_shares: String = '';

	@JsonProperty('description', Description)
	public description: Description = {} as Description;

	@JsonProperty('unbonding_height', String)
	public unbonding_height: String = '';

	@JsonProperty('unbonding_time', String)
	public unbonding_time: String = '';

	@JsonProperty('commission', Commission)
	public commission: Commission = {} as Commission;

	@JsonProperty('min_self_delegation', String)
	public min_self_delegation: String = '';

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
