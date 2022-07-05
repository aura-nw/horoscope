import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from "mongoose";
import { Coin } from "./coin.entity";
import { CustomInfo } from "./custom-info.entity";

export interface IAccountSpendableBalances {
    _id: Types.ObjectId | string | null;
    address: String;
    spendable_balances: Coin[];
    custom_info: CustomInfo;
}

@JsonObject('AccountSpendableBalances')
export class AccountSpendableBalancesEntity implements IAccountSpendableBalances {
    @JsonProperty('_id', String, true)
    _id = Config.DB_ACCOUNT_SPENDABLE_BALANCES.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('spendable_balances', [Coin], true)
    spendable_balances: Coin[] = [];
    custom_info = {} as CustomInfo;

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}