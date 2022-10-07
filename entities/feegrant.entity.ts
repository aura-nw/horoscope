import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';
import { ICoin ,Coin } from './coin.entity';
import { FEEGRANT_STATUS } from 'common/constant';
export interface IFeegrant {
	_id: ObjectIdNull;
	tx_hash: String;
	granter: String;
    grantee: String;
    result: Boolean;
    type: String;
	timestamp: Date | null;
	spend_limit: ICoin;
	expiration: Date | null;
	spendable: ICoin;
	status: FEEGRANT_STATUS | null
}
@JsonObject('Feegrant')
export class FeegrantEntity implements IFeegrant {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('tx_hash', String)
	tx_hash: String = '';
	@JsonProperty('granter', String)
	granter: String='';
	@JsonProperty('grantee', String)
	grantee: String='';
	@JsonProperty('result', Boolean)
	result: Boolean =true;
	@JsonProperty('type', String)
	type: String='';
	@JsonProperty('timestamp', Date)
	timestamp: Date | null =null;
	@JsonProperty('spend_limit', Coin, true)
	spend_limit: Coin={} as Coin;
	@JsonProperty('expiration', Date)
	expiration: Date | null = null;
	@JsonProperty('spendable', Coin, true)
	spendable: Coin={} as Coin;
	@JsonProperty('timestamp', String)
	status: FEEGRANT_STATUS | null =null;
}