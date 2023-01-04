/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';
import { Config } from '../common';
import { ISigningInfo } from '../model/signing-info.model';
import { Coin, ICoin } from './coin.entity';
import { SigningInfoEntity } from './signing-info.entity';

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
	commission_rates: ICommissionRate;
	update_time: String;
}

export interface IValidator {
	_id: ObjectIdNull;
	operator_address: String;
	consensus_pubkey: IConsensusPubkey;
	consensus_hex_address: String;
	jailed: Boolean;
	status: String;
	tokens: String;
	delegator_shares: String;
	description: IDescription;
	unbonding_height: String;
	unbonding_time: String;
	commission: ICommission;
	min_self_delegation: String;
	self_delegation_balance: ICoin;
	uptime: Number;
	val_signing_info: ISigningInfo;
	account_address: String;
	percent_voting_power: Number;
	number_delegators: Number;
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
	commission_rates: CommissionRate = {} as CommissionRate;
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

	@JsonProperty('consensus_hex_address', String)
	public consensus_hex_address: String = '';

	@JsonProperty('self_delegation_balance', Coin)
	public self_delegation_balance: Coin = {} as Coin;

	public uptime: Number = 0;

	public val_signing_info: ISigningInfo = {} as ISigningInfo;

	@JsonProperty('account_address', String)
	public account_address: String = '';

	@JsonProperty('percent_voting_power', Number)
	public percent_voting_power: Number = 0;

	public number_delegators: Number = 0;
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && this._id.toString() };
	}
}
