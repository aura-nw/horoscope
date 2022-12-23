/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
import { Types } from 'mongoose';
import { Config } from '../common';

export interface ICW4973Media {
	_id: Types.ObjectId | string | null;
	key: String;
	source: String;
	media_link: String;
	status: String;
	content_type: String;
}
