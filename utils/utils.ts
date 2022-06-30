import { Config } from 'common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../common/constant';

export class Utils {
	public static getUrlByChainIdAndType(chainId: string, typeUrl: string) {
		let chain = LIST_NETWORK.find((chain) => chain.chainId === chainId);
		if (chain) {
			switch (typeUrl) {
				case URL_TYPE_CONSTANTS.LCD:
					return chain.LCD;
				case URL_TYPE_CONSTANTS.RPC:
					return chain.RPC;
				default:
					return null;
			}
		}
		return null;
	}
}
