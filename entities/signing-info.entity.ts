import { JsonObject, JsonProperty } from 'json2typescript';

export interface ISigningInfo {
	address: String;
	startHeight: String;
	index_offset: String;
	jailed_until: String;
	tombstoned: Boolean;
	jailed_umissed_blocks_counterntil: String;
}

@JsonObject('SigningInfo')
export class SigningInfoEntity implements ISigningInfo {
	@JsonProperty('address', String)
	address: String = '';
	@JsonProperty('start_height', String)
	startHeight: String = '';
	@JsonProperty('index_offset', String)
	index_offset: String = '';
	@JsonProperty('jailed_until', String)
	jailed_until: String = '';
	@JsonProperty('tombstoned', Boolean)
	tombstoned: Boolean = false;
	@JsonProperty('missed_blocks_counter', String)
	jailed_umissed_blocks_counterntil: String = '';
}
