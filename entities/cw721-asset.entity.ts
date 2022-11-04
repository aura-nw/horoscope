import { Types } from 'mongoose';
import { Config } from '../common';

export interface ICW721Asset {
	_id: Types.ObjectId | string | null;
	asset_id: String;
	code_id: String;
	asset_info: Object;
	contract_address: String;
	token_id: String;
	owner: String;
	media_link: String;
	history: String[];
	is_burned: Boolean;
	metadata: any;
}

export class CW721AssetEntity implements ICW721Asset {
	_id = Config.DB_CW721_ASSET.dialect === 'local' ? Types.ObjectId() : null;
	asset_id: String = '';
	code_id: String = '';
	asset_info: Object = {};
	contract_address: String = '';
	token_id: String = '';
	owner: String = '';
	media_link: String = '';
	history: String[] = [];
	is_burned: Boolean = false;
	metadata: any = {};

	image: Object = {};
	animation: Object = {};
}
