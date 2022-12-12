/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';
import { Config } from '../common';
import { Coin, ICoin } from './coin.entity';

export interface ICommunityPool {
	_id: ObjectIdNull;
	pool: ICoin[];
}
@JsonObject('CommunityPool')
export class CommunityPoolEntity {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('pool', [Coin])
	pool: Coin[] = [];
}
