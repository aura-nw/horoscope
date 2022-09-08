import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Coin, ICoin } from './coin.entity';
import { CustomInfo, ICustomInfo } from './custom-info.entity';

export interface IReward {
	validator_address: String;
	rewards: ICoin[];
}
export interface IAccountClaimedRewards {
	_id: Types.ObjectId | string | null;
	address: String;
	validator_reward: IReward[];
	custom_info: ICustomInfo;
}

class Rewards implements IReward {
	validator_address: String = '';
	rewards: Coin[] = [];
}

export class AccountClaimedRewards implements IAccountClaimedRewards {
	_id = Config.DB_ACCOUNT_REWARDS.dialect === 'local' ? Types.ObjectId() : null;
	address: String = '';
	validator_reward: Rewards[] = [];
	custom_info: CustomInfo = {} as CustomInfo;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
