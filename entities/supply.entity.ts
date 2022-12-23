/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Config } from '../common';
import { Coin } from './coin.entity';

export interface ISupply {
	_id: Types.ObjectId | string | null;
	supply: Coin[];
}

export class SupplyEntity implements ISupply {
	@JsonProperty('_id', String, true)
	_id = Config.DB_SUPPLY.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('supply', [Coin], true)
	supply: Coin[] = [];

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && this._id.toString() };
	}
}
