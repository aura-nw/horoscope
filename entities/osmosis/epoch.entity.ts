import { DateConverter } from '../converters/date.converter';
import { JsonObject, JsonProperty } from 'json2typescript';

export interface IEpoch {
	identifier: String;
	start_time: String;
	duration: String;
	current_epoch: String;
	current_epoch_start_time: String;
	epoch_counting_started: String;
	current_epoch_start_height: String;
}

@JsonObject('Epoch')
export class Epoch {
	@JsonProperty('identifier', String)
	identifier: String = '';
	@JsonProperty('start_time', DateConverter, true)
	start_time: Date | null = null;
	@JsonProperty('duration', String)
	duration: String = '';
}
