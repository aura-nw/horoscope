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
		return Buffer.from(new Uint8Array(decodedAddress.words)).toString('hex').toUpperCase();
	}

	public static operatorAddressToAddress(operatorAddress: string, prefix: string) {
		const operator_address = operatorAddress;
		const decodeAcc = bech32.decode(operator_address.toString());
		const wordsByte = bech32.fromWords(decodeAcc.words);
		return bech32.encode(prefix, bech32.toWords(wordsByte));
	}

	public static formatSearchQueryInTxSearch(query: string) {
		let queryArray = query.split(',');
		let queryObject: any[] = [];
		queryArray.forEach((element) => {
			let keyValueList = element.split('=');
			if (keyValueList.length === 2) {
				let value = keyValueList[1];
				let typeKeyList = keyValueList[0].split('.');
				if (typeKeyList.length === 2) {
					let type = typeKeyList[0];
					let key = typeKeyList[1];
					queryObject.push({
						type: type,
						key: key,
						value: value,
					});
				}
			}
		});
		return queryObject;
	}
}
