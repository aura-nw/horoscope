import { JsonConverter, JsonCustomConvert } from 'json2typescript';

@JsonConverter
export class NumericConverter implements JsonCustomConvert<Number | null> {
	public serialize(number: Number): String | null {
		return number.toString();
	}

	public deserialize(string: String): Number {
		let number = Number(string);
		return number;
	}
}
