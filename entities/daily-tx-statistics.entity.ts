import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { Types } from 'mongoose';
import { DateConverter } from "./converters/date.converter";

export interface IDailyTxStatistics {
    _id: Types.ObjectId | string | null;
    daily_txs: Number;
    daily_active_addresses: Number;
    unique_addresses: Number;
    unique_addresses_increase: Number;
    date: Date | null;
}

@JsonObject('DailyTxStatistics')
export class DailyTxStatistics implements IDailyTxStatistics {
    @JsonProperty('_id', String, true)
	_id = Config.DB_DAILY_TX_STATISTICS.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('daily_txs', Number)
    daily_txs: Number = 0;
    @JsonProperty('daily_active_addresses', Number)
    daily_active_addresses: Number = 0;
    @JsonProperty('unique_addresses', Number)
    unique_addresses: Number = 0;
    @JsonProperty('unique_addresses_increase', Number)
    unique_addresses_increase: Number = 0;
    @JsonProperty('date', DateConverter)
    date: Date | null = null;
}