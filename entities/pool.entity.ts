import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Pool')
export class PoolEntity {
	@JsonProperty('not_bonded_tokens', String)
	not_bonded_tokens: String = '';
	@JsonProperty('bonded_tokens', String)
	bonded_tokens: String = '';
}
