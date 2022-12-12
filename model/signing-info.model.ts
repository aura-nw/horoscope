/* eslint-disable camelcase */
import { ObjectIdNull } from '../types';

export interface ISigningInfo {
	_id: ObjectIdNull;
	address: string;
	start_height: string;
	index_offset: string;
	jailed_until: string;
	tombstoned: boolean;
	missed_blocks_counter: string;
}
