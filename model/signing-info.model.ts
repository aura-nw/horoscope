import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ISigningInfo {
	_id: ObjectIdNull;
	address: String;
	start_height: String;
	index_offset: String;
	jailed_until: String;
	tombstoned: Boolean;
	missed_blocks_counter: String;
}

