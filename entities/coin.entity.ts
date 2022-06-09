import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Coin')
export class Coin {
	@JsonProperty('amount', String)
	amount: String = '';
	@JsonProperty('denom', String)
	denom: String = '';
}
