/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';
import { Config } from '../common';
export interface IPool {
	_id: ObjectIdNull;
	not_bonded_tokens: String;
	bonded_tokens: String;
}
@JsonObject('Pool')
export class PoolEntity implements IPool {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('not_bonded_tokens', String)
	not_bonded_tokens: String = '';
	@JsonProperty('bonded_tokens', String)
	bonded_tokens: String = '';
}
