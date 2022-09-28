import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { CustomInfo, ICustomInfo } from "./custom-info.entity";
import { Coin, ICoin } from "./coin.entity";
import { DateConverter } from "./converters/date.converter";
import { Description, IDescription } from "./validator.entity";

export interface IAccountInfo {
    _id: Types.ObjectId | string | null;
    address: String;
    account_auth: IAccount;
    account_balances: ICoin[];
    account_delegations: IDelegationResponse[];
    account_redelegations: IRedelegationResponse[];
    account_spendable_balances: ICoin[];
    account_unbonding: IUnbondingResponse[];
    account_claimed_rewards: IReward[];
    custom_info: ICustomInfo;
}

export interface IAccountPubKey {
    type: String;
    value: String;
}

export interface IAccountValue {
    address: String;
    public_key: IAccountPubKey;
    account_number: String;
    sequence: String;
}

export interface IAccountResult {
    type: String;
    value: Object;
}

export interface IAccount {
    height: String;
    result: Object;
}

export interface IDelegation {
    delegator_address: String;
    validator_address: String;
    shares: String;
}

export interface IDelegationResponse {
    delegation: IDelegation;
    balance: ICoin;
}

export interface IRedelegationEntry {
    creation_height: String;
    completion_time: Date | null;
    initial_balance: String;
    shares_dst: String;
}

export interface IRedelegateEntry {
    redelegation_entry: IRedelegationEntry;
    balance: String;
}

export interface IRedelegation {
    delegator_address: String;
    validator_src_address: String;
    validator_dst_address: String;
    entries: IRedelegateEntry[];
}

export interface IRedelegationResponse {
    redelegation: IRedelegation;
    entries: IRedelegateEntry[];
}

export interface IUndelegateEntry {
    creation_height: String;
    completion_time: Date | null;
    initial_balance: String;
    balance: String;
}

export interface IUnbondingResponse {
    delegator_address: String;
    validator_address: String;
    validator_description: IDescription;
    entries: IUndelegateEntry[];
}

export interface IReward {
	validator_address: String;
	amount: String;
	denom: String;
}

export class AccountPubKey implements IAccountPubKey {
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('value', String)
    value: String = '';
}

export class AccountValue implements IAccountValue {
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('public_key', AccountPubKey, true)
    public_key = {} as AccountPubKey;
    @JsonProperty('account_number', String)
    account_number: String = '';
    @JsonProperty('sequence', String, true)
    sequence: String = '';
}

export class AccountResult implements IAccountResult {
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('value', Object, true)
    value = {} as Object;
}

export class Account implements IAccount {
    @JsonProperty('height', String)
    height: String = '';
    @JsonProperty('result', Object, true)
    result = {} as Object;
}

export class Delegation implements IDelegation {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_address', String)
    validator_address: String = '';
    @JsonProperty('shares', String)
    shares: String = '';
}

export class DelegationResponse implements IDelegationResponse {
    @JsonProperty('delegation', Delegation)
    delegation = {} as Delegation;
    @JsonProperty('JsonProperty', Coin)
    balance = {} as Coin;
}

export class RedelegationEntry implements IRedelegationEntry {
    @JsonProperty('creation_height', String)
    creation_height: String = '';
    @JsonProperty('completion_time', DateConverter)
    completion_time: Date | null = null;
    @JsonProperty('initial_balance', String)
    initial_balance: String = '';
    @JsonProperty('shares_dst', String)
    shares_dst: String = '';
}

export class RedelegateEntry implements IRedelegateEntry {
    @JsonProperty('redelegation_entry', RedelegationEntry)
    redelegation_entry = {} as RedelegationEntry;
    @JsonProperty('balance', String)
    balance: String = '';
}

export class Redelegation implements IRedelegation {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_src_address', String)
    validator_src_address: String = '';
    @JsonProperty('validator_dst_address', String)
    validator_dst_address: String = '';
    @JsonProperty('entries', [RedelegateEntry], true)
    entries: RedelegateEntry[] = [];
}

export class UndelegateEntry implements IUndelegateEntry {
    @JsonProperty('creation_height', String)
    creation_height: String = '';
    @JsonProperty('completion_time', DateConverter)
    completion_time: Date | null = null;
    @JsonProperty('initial_balance', String)
    initial_balance: String = '';
    @JsonProperty('balance', String)
    balance: String = '';
}

export class UnbondingResponse implements IUnbondingResponse {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_address', String)
    validator_address: String = '';
    @JsonProperty('validator_description', Description)
    validator_description = {} as Description;
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
	validator_address: String = '';
	amount: String = '';
	denom: String  = '';
}

@JsonObject('AccountInfo')
export class AccountInfoEntity implements IAccountInfo {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_INFO.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
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
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}