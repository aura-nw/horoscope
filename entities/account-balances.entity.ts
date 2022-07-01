import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { Coin } from "./coin.entity";

export interface IAccountBalances {
    _id: Types.ObjectId | string | null;
    address: String;
    balances: Coin[];
}

@JsonObject('AccountBalances')
export class AccountBalancesEntity implements IAccountBalances {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_BALANCES.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('balances', [Coin], true)
    balances: Coin[] = [];

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}