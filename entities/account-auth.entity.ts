import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";

export interface IAccountAuth {
    _id: Types.ObjectId | string | null;
    address: String;
    account: Account;
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
    @JsonProperty('public_key', AccountPubKey, true)
    public_key = {} as AccountPubKey;
    @JsonProperty('account_number', String)
    account_number: String = '';
    @JsonProperty('sequence', String, true)
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

@JsonObject('AccountAuth')
export class AccountAuthEntity implements IAccountAuth {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_AUTH.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('account', Account)
    account = {} as Account;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}