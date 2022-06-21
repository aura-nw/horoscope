import { Config } from '../common';

export const customInfoModel = {
	chain_id: {
		type: String,
		default: Config.CHAIN_ID,
	},
	chain_name: {
		type: String,
		default: Config.CHAIN_NAME,
	},
};
