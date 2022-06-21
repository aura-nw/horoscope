import { JsonObject, JsonProperty } from 'json2typescript';
import { Coin } from './coin.entity';

@JsonObject('CommunityPool')
export class CommunityPoolEntity {
	@JsonProperty('pool', [Coin])
	pool: Coin[] = [];
}
