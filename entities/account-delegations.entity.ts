import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { Coin } from "./coin.entity";

export interface IAccountDelegations {
    _id: Types.ObjectId | string | null;
    address: String;
    delegation_responses: DelegationResponse[];
}

export class Delegation {
    @JsonProperty('delegator_address', String)
    delegator_address: String = '';
    @JsonProperty('validator_address', String)
    validator_address: String = '';
    @JsonProperty('shares', String)
    shares: String = '';
}

export class DelegationResponse {
    @JsonProperty('delegation', Delegation)
    delegation = {} as Delegation;
    @JsonProperty('JsonProperty', Coin)
    balance = {} as Coin;
}

@JsonObject('AccountDelegations')
export class AccountDelegationsEntity implements IAccountDelegations {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_DELEGATIONS.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('delegation_responses', [DelegationResponse], true)
    delegation_responses: DelegationResponse[] = [];

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}