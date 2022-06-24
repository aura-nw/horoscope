import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';

export interface IPool {
	_id: Types.ObjectId | string | null;
	not_bonded_tokens: String;
	bonded_tokens: String;
}

@JsonObject('Pool')
export class PoolEntity {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('not_bonded_tokens', String)
	not_bonded_tokens: String = '';
	@JsonProperty('bonded_tokens', String)
	bonded_tokens: String = '';
}
