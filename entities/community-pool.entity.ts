import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Coin } from './coin.entity';
import { Types } from 'mongoose';
import { ICoin } from '@Model';

export interface ICommunityPool {
	_id: Types.ObjectId | string | null;
	pool: ICoin[];
}

@JsonObject('CommunityPool')
export class CommunityPoolEntity {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('pool', [Coin])
	pool: Coin[] = [];
}
