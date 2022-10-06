import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';

export interface IDailyStats {
    total_sent_tx: Number;
    total_received_tx: Number;
    total_sent_amount: Number;
    total_received_amount: Number;
}

export interface IAccountStatistics {
    _id: Types.ObjectId | string | null;
    address: String;
    per_day: IDailyStats[];
    one_day: IDailyStats;
    three_days: IDailyStats;
    seven_days: IDailyStats;
}

export class DailyStats implements IDailyStats {
    @JsonProperty('total_sent_tx', Number)
    total_sent_tx: Number = 0;
    @JsonProperty('total_received_tx', Number)
    total_received_tx: Number = 0;
    @JsonProperty('total_sent_amount', Number)
    total_sent_amount: Number = 0;
    @JsonProperty('total_received_amount', Number)
    total_received_amount: Number = 0;
    
}

@JsonObject('AccountStatistics')
export class AccountStatistics implements IAccountStatistics {
    @JsonProperty('_id', String, true)
	_id = Config.DB_ACCOUNT_STATISTICS.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: String = '';
    @JsonProperty('per_day', [DailyStats])
    per_day = [] as DailyStats[];
    @JsonProperty('one_day', DailyStats)
    one_day = {} as DailyStats;
    @JsonProperty('three_days', DailyStats)
    three_days = {} as DailyStats;
    @JsonProperty('seven_days', DailyStats)
    seven_days = {} as DailyStats;
}