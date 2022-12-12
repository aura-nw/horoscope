/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Config } from '../common';
import { CustomInfo, ICustomInfo } from './custom-info.entity';
import { Coin, ICoin } from './coin.entity';
import { DateConverter } from './converters/date.converter';

export interface IAccountInfo {
	_id: Types.ObjectId | string | null;
	address: string;
	account_auth: IAccount;
	account_balances: ICoin[];
	account_delegations: IDelegationResponse[];
	account_redelegations: IRedelegationResponse[];
	account_spendable_balances: ICoin[];
	account_unbonding: IUnbondingResponse[];
	account_claimed_rewards: IReward[];
	custom_info: ICustomInfo;
}

export interface IAccount {
	account: Object;
}

export interface IDelegation {
	delegator_address: string;
	validator_address: string;
	shares: string;
}

export interface IDelegationResponse {
	delegation: IDelegation;
	balance: ICoin;
}

export interface IRedelegationEntry {
	creation_height: string;
	completion_time: Date | null;
	initial_balance: string;
	shares_dst: string;
}

export interface IRedelegateEntry {
	redelegation_entry: IRedelegationEntry;
	balance: string;
}

export interface IRedelegation {
	delegator_address: string;
	validator_src_address: string;
	validator_dst_address: string;
	entries: IRedelegateEntry[];
}

export interface IRedelegationResponse {
	redelegation: IRedelegation;
	entries: IRedelegateEntry[];
}

export interface IUndelegateEntry {
	creation_height: string;
	completion_time: Date | null;
	initial_balance: string;
	balance: string;
}

export interface IUnbondingResponse {
	delegator_address: string;
	validator_address: string;
	entries: IUndelegateEntry[];
}

export interface IReward {
	validator_address: string;
	amount: string;
	denom: string;
}

export class Account implements IAccount {
	@JsonProperty('account', Object, true)
	account = {} as Object;
}

export class Delegation implements IDelegation {
	@JsonProperty('delegator_address', String)
	delegator_address = '';
	@JsonProperty('validator_address', String)
	validator_address = '';
	@JsonProperty('shares', String)
	shares = '';
}

export class DelegationResponse implements IDelegationResponse {
	@JsonProperty('delegation', Delegation)
	delegation = {} as Delegation;
	@JsonProperty('JsonProperty', Coin)
	balance = {} as Coin;
}

export class RedelegationEntry implements IRedelegationEntry {
	@JsonProperty('creation_height', String)
	creation_height = '';
	@JsonProperty('completion_time', DateConverter)
	completion_time: Date | null = null;
	@JsonProperty('initial_balance', String)
	initial_balance = '';
	@JsonProperty('shares_dst', String)
	shares_dst = '';
}

export class RedelegateEntry implements IRedelegateEntry {
	@JsonProperty('redelegation_entry', RedelegationEntry)
	redelegation_entry = {} as RedelegationEntry;
	@JsonProperty('balance', String)
	balance = '';
}

export class Redelegation implements IRedelegation {
	@JsonProperty('delegator_address', String)
	delegator_address = '';
	@JsonProperty('validator_src_address', String)
	validator_src_address = '';
	@JsonProperty('validator_dst_address', String)
	validator_dst_address = '';
	@JsonProperty('entries', [RedelegateEntry], true)
	entries: RedelegateEntry[] = [];
}

export class UndelegateEntry implements IUndelegateEntry {
	@JsonProperty('creation_height', String)
	creation_height = '';
	@JsonProperty('completion_time', DateConverter)
	completion_time: Date | null = null;
	@JsonProperty('initial_balance', String)
	initial_balance = '';
	@JsonProperty('balance', String)
	balance = '';
}

export class UnbondingResponse implements IUnbondingResponse {
	@JsonProperty('delegator_address', String)
	delegator_address = '';
	@JsonProperty('validator_address', String)
	validator_address = '';
	@JsonProperty('entries', [UndelegateEntry])
	entries: UndelegateEntry[] = [];
}

export class RedelegationResponse implements IRedelegationResponse {
	@JsonProperty('redelegation', Redelegation)
	redelegation = {} as Redelegation;
	@JsonProperty('entries', [RedelegateEntry])
	entries: RedelegateEntry[] = [];
}

export class Rewards implements IReward {
	validator_address = '';
	amount = '';
	denom = '';
}

@JsonObject('AccountInfo')
export class AccountInfoEntity implements IAccountInfo {
	@JsonProperty('_id', String, true)
	_id = Config.DB_ACCOUNT_INFO.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('address', String)
	address = '';
	@JsonProperty('account_auth', Account, true)
	account_auth: Account = {} as Account;
	@JsonProperty('account_balances', [Coin], true)
	account_balances: Coin[] = [];
	@JsonProperty('account_delegations', [DelegationResponse], true)
	account_delegations: DelegationResponse[] = [];
	@JsonProperty('account_redelegations', [RedelegationResponse], true)
	account_redelegations: RedelegationResponse[] = [];
	@JsonProperty('account_spendable_balances', [Coin], true)
	account_spendable_balances: Coin[] = [];
	@JsonProperty('account_unbonding', [UnbondingResponse], true)
	account_unbonding: UnbondingResponse[] = [];
	@JsonProperty('account_claimed_rewards', [Rewards], true)
	account_claimed_rewards: Rewards[] = [];
	custom_info = {} as CustomInfo;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && this._id.toString() };
	}
}
