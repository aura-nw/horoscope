import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";

export interface IAccountInfo {
    _id: Types.ObjectId | string | null;
    address: String;
    balances: Balance[];
    delegation_responses: DelegationResponse[];
    redelegation_responses: RedelegationResponse[];
    unbonding_responses: UnbondingResponse[];
    account: Account;
    spendable_balances: Balance[];
}

export class Delegation {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_address', String)
    validator_address: String = '';
    @JsonProperty('shares', String)
    shares: String = '';
}

export class Balance {
    @JsonProperty('denom', String)
	denom: String = '';
	@JsonProperty('amount', String)
	amount: String = '';
}

export class DelegationResponse {
    @JsonProperty('delegation', Delegation)
    delegation = {} as Delegation;
    @JsonProperty('JsonProperty', Balance)
    balance = {} as Balance;
}

export class RedelegationEntry {
    @JsonProperty('creation_height', String)
    creation_height: String = '';
    @JsonProperty('completion_time', String)
    completion_time: String = '';
    @JsonProperty('initial_balance', String)
    initial_balance: String = '';
    @JsonProperty('shares_dst', String)
    shares_dst: String = '';
}

export class RedelegateEntry {
    @JsonProperty('redelegation_entry', RedelegationEntry)
    redelegation_entry = {} as RedelegationEntry;
    @JsonProperty('balance', String)
    balance: String = '';
}

export class Redelegation {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_src_address', String)
    validator_src_address: String = '';
    @JsonProperty('validator_dst_address', String)
    validator_dst_address: String = '';
    @JsonProperty('entries', [RedelegateEntry], true)
    entries: RedelegateEntry[] = [];
}

export class RedelegationResponse {
    @JsonProperty('redelegation', Redelegation)
    redelegation = {} as Redelegation;
    @JsonProperty('entries', [RedelegateEntry])
    entries: RedelegateEntry[] = [];
}

export class UndelegateEntry {
    @JsonProperty('creation_height', String)
    creation_height: String = '';
    @JsonProperty('completion_time', String)
    completion_time: String = '';
    @JsonProperty('initial_balance', String)
    initial_balance: String = '';
    @JsonProperty('balance', String)
    balance: String = '';
}

export class UnbondingResponse {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_address', String)
    validator_address: String = '';
    @JsonProperty('entries', [UndelegateEntry])
    entries: UndelegateEntry[] = [];
}

export class AccountPubKey {
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('value', String)
    value: String = '';
}

export class AccountValue {
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('public_key', AccountPubKey)
    public_key = {} as AccountPubKey;
    @JsonProperty('account_number', String)
    account_number: String = '';
    @JsonProperty('sequence', String)
    sequence: String = '';
}

export class AccountResult {
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('value', AccountValue, true)
    value= {} as AccountValue;
}

export class Account {
    @JsonProperty('height', String)
    height: String = '';
    @JsonProperty('result', AccountResult)
    result = {} as AccountResult;
}

@JsonObject('AccountInfo')
export class AccountInfoEntity implements IAccountInfo {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_INFO.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('balances', [Balance], true)
    balances: Balance[] = [];
    @JsonProperty('delegation_responses', [DelegationResponse], true)
    delegation_responses: DelegationResponse[] = [];
    @JsonProperty('redelegation_responses', [RedelegationResponse], true)
    redelegation_responses: RedelegationResponse[] = [];
    @JsonProperty('unbonding_responses', [UnbondingResponse], true)
    unbonding_responses: UnbondingResponse[] = [];
    @JsonProperty('account', Account, true)
    account: Account = {} as Account;
    @JsonProperty('spendable_balances', [Balance], true)
    spendable_balances: Balance[] = [];

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}