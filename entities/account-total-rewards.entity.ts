import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Coin, ICoin } from './coin.entity';
import { CustomInfo, ICustomInfo } from './custom-info.entity';

export interface IReward {
	validatorAddress: String;
	rewards: ICoin[];
}
export interface IAccountTotalRewards {
	_id: Types.ObjectId | string | null;
	address: String;
	validatorReward: IReward[];
	custom_info: ICustomInfo;
}

class Rewards implements IReward {
	validatorAddress: String = '';
	rewards: Coin[] = [];
}

export class AccountTotalRewards implements IAccountTotalRewards {
	_id = Config.DB_ACCOUNT_REWARDS.dialect === 'local' ? Types.ObjectId() : null;
	address: String = '';
	validatorReward: Rewards[] = [];
	custom_info: CustomInfo = {} as CustomInfo;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
