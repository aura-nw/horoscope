import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { ObjectIdNull } from 'types';
import { Types } from 'mongoose';
import { DateConverter } from './converters/date.converter';
import { CustomInfo, ICustomInfo } from './custom-info.entity';

export interface IVote {
	_id: ObjectIdNull;
	voter_address: String;
	proposal_id: Number;
	answer: String;
	txhash: String;
	timestamp: Date | null;
	custom_info: ICustomInfo;
	code: String
}

@JsonObject('Vote')
export class VoteEntity implements IVote {
	@JsonProperty('_id', String, true)
	_id = Config.DB_DELAY_JOB.dialect === 'local' ? Types.ObjectId() : null;

	@JsonProperty('voter_address', String)
	voter_address: String = '';

	@JsonProperty('proposal_id', Number)
	proposal_id: Number = 0;

	@JsonProperty('answer', String)
	answer: String = '';

	@JsonProperty('txhash', String)
	txhash: String = '';

	@JsonProperty('timestamp', DateConverter)
	timestamp: Date | null = null;

	@JsonProperty('height', Number)
	height: Number = 0;

	@JsonProperty('code', String)
	code: String = "0";

	@JsonProperty('custom_info', CustomInfo, true)
	custom_info: CustomInfo = {} as CustomInfo;
}
