import { Config } from 'common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../common/constant';
// @ts-ignore
import { tmhash } from 'tendermint/lib/hash';
import { bech32 } from 'bech32';

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

	public static pubkeyBase64ToHexAddress(pubkey: string): string {
		var bytes = Buffer.from(pubkey, 'base64');
		return tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
	}

	public static hexToBech32(address: string, prefix: string) {
		let addressBuffer = Buffer.from(address, 'hex');
		return bech32.encode(prefix, bech32.toWords(addressBuffer));
	}

	public static bech32ToHex(address: string) {
		let decodedAddress = bech32.decode(address);
		return Buffer.from(new Uint8Array(bech32.fromWords(decodedAddress.words)))
			.toString('hex')
			.toUpperCase();
	}
}
