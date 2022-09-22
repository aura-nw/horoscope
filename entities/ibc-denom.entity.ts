import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';

export interface IIBCDenom {
    _id: Types.ObjectId | string | null;
    hash: string;
    denom: string;
}

export class IBCDenomEntity {
    @JsonProperty('_id', String, true)
	_id = Config.DB_IBC_DENOM.dialect === 'local' ? Types.ObjectId() : null;

    @JsonProperty('hash', String)
    hash: String = '';

    @JsonProperty('denom', String)
    denom: String = '';

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}