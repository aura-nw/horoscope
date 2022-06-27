import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class NumericConverter implements JsonCustomConvert<Number | BigInt | null> {
	public serialize(number: Number | BigInt): String | null {
		return number.toString();
	}

	public deserialize(string: String): Number | BigInt {
		// let bigInt = BigInt(string.toString());
		// if (bigInt > BigInt(Number.MAX_SAFE_INTEGER)) {
		// 	return Number(string);
		// }
		// return bigInt;
		return Number(string);
	}
}
