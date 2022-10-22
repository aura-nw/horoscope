import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';

export interface IStats {
    amount: Number;
    percentage: Number;
}

export interface IDailyStats {
    total_sent_tx: IStats;
    total_received_tx: IStats;
    total_sent_amount: IStats;
    total_received_amount: IStats;
}

export interface IAccountStatistics {
    _id: Types.ObjectId | string | null;
    address: String;
    per_day: IDailyStats[];
    one_day: IDailyStats;
    three_days: IDailyStats;
    seven_days: IDailyStats;
}

export class Stats implements IStats {
    @JsonProperty('amount', Number)
    amount: Number = 0;
    @JsonProperty('percentage', Number)
    percentage: Number = 0;
}

export class DailyStats implements IDailyStats {
    @JsonProperty('total_sent_tx', Stats)
    total_sent_tx = {} as Stats;
    @JsonProperty('total_received_tx', Stats)
    total_received_tx = {} as Stats;
    @JsonProperty('total_sent_amount', Stats)
    total_sent_amount = {} as Stats;
    @JsonProperty('total_received_amount', Stats)
    total_received_amount = {} as Stats;
    
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
