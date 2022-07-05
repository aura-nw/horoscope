import { Config } from 'common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../common/constant';
// @ts-ignore
import { tmhash } from 'tendermint/lib/hash';

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

	public static getHexAddressFromPubkey(pubkey: string): string {
		var bytes = Buffer.from(pubkey, 'base64');
		return tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
	}
}
