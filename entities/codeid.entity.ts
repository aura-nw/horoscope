import { Config } from 'common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { ICW721Asset } from '../model/cw721-asset.model';

export interface ICoin {
	amount: String;
	denom: String;
}

@JsonObject('Asset')
export class AssetEntity implements ICW721Asset {

	@JsonProperty('_id', String, true)
	_id = Config.DB_BLOCK.dialect === 'local' ? Types.ObjectId() : null;
	// @JsonProperty('asset_id', String)
	code_id: String = '';
	asset_id: String = '';
	constract_address: String = '';
	token_id: String = '';
	owner: String = '';
	history: String[] = [];
	// @JsonProperty('asset_info', Object)
	asset_info: Object = {};

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}