import { Config } from 'common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { IAsset } from '../model/asset.model';

export interface ICoin {
	amount: String;
	denom: String;
}

@JsonObject('Asset')
export class AssetEntity implements IAsset {
	// asset_id: String;
	code_id: String;
	asset_info: Object;
	constract_address: String;
	token_id: String;
	owner: String;
	history: String[];
	
	@JsonProperty('_id', String, true)
	_id = Config.DB_BLOCK.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('asset_id', String)
	asset_id: String  = '';
	@JsonProperty('asset_info', BlockDetail)
	asset_info: BlockDetail | null = null;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}