import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { CustomInfo } from "./custom-info.entity";

export interface IAccountUnbonds {
    _id: Types.ObjectId | string | null;
    address: String;
    unbonding_responses: UnbondingResponse[];
    custom_info: CustomInfo;
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

@JsonObject('AccountUnbonds')
export class AccountUnbondsEntity implements IAccountUnbonds {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_UNBONDS.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('unbonding_responses', [UnbondingResponse], true)
    unbonding_responses: UnbondingResponse[] = [];
    custom_info = {} as CustomInfo;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}