/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';
import { ObjectIdNull } from 'types';
import { Types } from 'mongoose';
import { Config } from '../common';
import { CustomInfo } from './custom-info.entity';
import { DateConverter } from './converters/date.converter';

export interface IDelayJob {
	_id: ObjectIdNull;
	content: Object;
	type: String;
	expire_time: Date | null;
	indexes: String;
	custom_info: CustomInfo;
}

@JsonObject('DelayJob')
export class DelayJobEntity implements IDelayJob {
	@JsonProperty('_id', String, true)
	_id = Config.DB_DELAY_JOB.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('content', Object)
	content = {} as Object;
	@JsonProperty('type', String)
	type: String = '';
	@JsonProperty('expire_time', DateConverter)
	expire_time: Date | null = null;
	@JsonProperty('indexes', String)
	indexes: String = '';
	@JsonProperty('custom_info', CustomInfo, true)
	custom_info = {} as CustomInfo;
}
