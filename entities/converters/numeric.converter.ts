/* eslint-disable id-blacklist */
import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class NumericConverter implements JsonCustomConvert<number | bigint | null> {
	public serialize(number: number | bigint): string | null {
		return number.toString();
	}

	public deserialize(string: string): number | bigint {
		// Let bigInt = BigInt(string.toString());
		// If (bigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
		// 	Return Number(string);
		// }
		// Return bigInt;
		return Number(string);
	}
}
