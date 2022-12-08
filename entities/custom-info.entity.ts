/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-classes-per-file */
export interface ICustomInfo {
	chain_id: String;
	chain_name: String;
}

export class CustomInfo implements ICustomInfo {
	chain_id: String = '';
	chain_name: String = '';
}
