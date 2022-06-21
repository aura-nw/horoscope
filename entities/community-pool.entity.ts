import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Coin } from './coin.entity';
import { Types } from 'mongoose';

@JsonObject('CommunityPool')
export class CommunityPoolEntity {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('pool', [Coin])
	pool: Coin[] = [];
}
