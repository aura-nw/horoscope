import { Config } from "common";
import { JsonObject, JsonProperty } from "json2typescript";
import { ObjectIdNull } from "types";
import { CustomInfo } from "./custom-info.entity";
import { Types } from "mongoose";

export interface IDelayJob {
    _id: ObjectIdNull;
    address: String;
    type: String;
    expire_time: String;
    custom_info: CustomInfo;
}

@JsonObject('DelayJob')
export class DelayJobEntity implements IDelayJob {
    @JsonProperty('_id', String, true)
    _id = Config.DB_DELAY_JOB.dialect === 'local' ? Types.ObjectId() : null;
    @JsonProperty('address', String)
    address: string = '';
    @JsonProperty('type', String)
    type: String = '';
    @JsonProperty('expire_time', String)
    expire_time: String = '';
    @JsonProperty('custom_info', CustomInfo, true)
    custom_info = {} as CustomInfo;
}