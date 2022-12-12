/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';

export interface ISigningInfo {
	address: String;
	start_height: String;
	index_offset: String;
	jailed_until: String;
	tombstoned: Boolean;
	missed_blocks_counter: String;
}

@JsonObject('SigningInfo')
export class SigningInfoEntity implements ISigningInfo {
	@JsonProperty('address', String)
	address: String = '';
	@JsonProperty('start_height', String)
	start_height: String = '';
	@JsonProperty('index_offset', String)
	index_offset: String = '';
	@JsonProperty('jailed_until', String)
	jailed_until: String = '';
	@JsonProperty('tombstoned', Boolean)
	tombstoned: Boolean = false;
	@JsonProperty('missed_blocks_counter', String)
	missed_blocks_counter: String = '';
}
