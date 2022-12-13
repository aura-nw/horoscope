/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { JsonObject, JsonProperty } from 'json2typescript';

export interface ICoin {
	amount: String;
	denom: String;
}

@JsonObject('Coin')
export class Coin {
	@JsonProperty('amount', String)
	amount: String = '';
	@JsonProperty('denom', String)
	denom: String = '';
}
