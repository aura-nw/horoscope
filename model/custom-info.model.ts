import { LIST_NETWORK } from '../common/constant';
import { Config } from '../common';

export const customInfoModel = {
	chain_id: {
		type: String,
		default: Config.CHAIN_ID,
		index: true,
	},
	chain_name: {
		type: String,
		default: LIST_NETWORK.find(x => x.chainId == Config.CHAIN_ID)?.chainName,
	},
};
