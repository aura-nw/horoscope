import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ObjectIdNull } from 'types';
import { ICoin, Coin } from './coin.entity';
import { FEEGRANT_ACTION, FEEGRANT_STATUS } from 'common/constant';
import { CustomInfo } from './custom-info.entity';
export interface IFeegrant {
	_id: ObjectIdNull;
	tx_hash: String,
	origin_feegrant_txhash: String | null;
	granter: String;
	grantee: String;
	result: Boolean;
	type: String;
	timestamp: Date;
	expired: Boolean;
	spend_limit: ICoin;
	expiration: Date | null;
	amount: ICoin;
	status: FEEGRANT_STATUS | null
	action: FEEGRANT_ACTION | ""
	custom_info: CustomInfo
}
@JsonObject('Feegrant')
export class FeegrantEntity implements IFeegrant {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('tx_hash', String)
	tx_hash: String = '';
	@JsonProperty('origin_feegrant_txhash', String)
	origin_feegrant_txhash: String | null = null;
	@JsonProperty('granter', String)
	granter: String = '';
	@JsonProperty('grantee', String)
	grantee: String = '';
	@JsonProperty('result', Boolean)
	result: Boolean = true;
	@JsonProperty('type', String)
	type: String = '';
	@JsonProperty('timestamp', Date)
	timestamp: Date = new Date(-8640000000000000);
	@JsonProperty('spend_limit', Coin, true)
	spend_limit: Coin = {} as Coin;
	@JsonProperty('expiration', Date)
	expiration: Date | null = null;
	@JsonProperty('spendable', Coin, true)
	amount: Coin = {} as Coin;
	@JsonProperty('status', String)
	status: FEEGRANT_STATUS | null = null;
	@JsonProperty('action', String)
	action: FEEGRANT_ACTION | "" = "";
	@JsonProperty('expired', Boolean)
	expired: Boolean = false;
	custom_info: CustomInfo = {} as CustomInfo;
}