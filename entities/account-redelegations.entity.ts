import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { CustomInfo } from "./custom-info.entity";

export interface IAccountRedelegations {
    _id: Types.ObjectId | string | null;
    address: String;
    redelegation_responses: RedelegationResponse[];
    custom_info: CustomInfo;
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

@JsonObject('AccountRedelegations')
export class AccountRedelegationsEntity implements IAccountRedelegations {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_REDELEGATIONS.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('redelegation_responses', [RedelegationResponse], true)
    redelegation_responses: RedelegationResponse[] = [];
    custom_info = {} as CustomInfo;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}