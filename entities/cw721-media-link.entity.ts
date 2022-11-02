import { Types } from 'mongoose';
import { Config } from '../common';

export interface ICW721Media {
	_id: Types.ObjectId | string | null;
	key: String;
	source: String;
	media_link: String;
	status: String;
	content_type: String;
}
