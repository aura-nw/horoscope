import { Config } from "../common";
import { JsonObject, JsonProperty } from "json2typescript";
import { ObjectIdNull } from "types";
import { CustomInfo } from "./custom-info.entity";
import { Types } from "mongoose";
import { DateConverter } from "./converters/date.converter";

export interface IDelayJob {
    _id: ObjectIdNull;
    content: Object;
    type: String;
    expire_time: Date | null;
    status: String;
    custom_info: CustomInfo;
}

@JsonObject('DelayJob')
export class DelayJobEntity implements IDelayJob {
    @JsonProperty('_id', String, true)
    _id = Config.DB_DELAY_JOB.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('content', Object)
    content: Object = {};
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('expire_time', DateConverter)
    expire_time: Date | null = null;
    @JsonProperty('status', String)
    status: String = '';
    @JsonProperty('custom_info', CustomInfo, true)
    custom_info = {} as CustomInfo;
}