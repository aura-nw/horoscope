import { fromBech32 } from '@cosmjs/encoding';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../common/constant';
export class Utils {
	public static getUrlByChainIdAndType(chainId: string, typeUrl: string) {
		const chain = LIST_NETWORK.find((chainItem) => chainItem.chainId === chainId);
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

	public static formatSearchQueryInTxSearch(query: string) {
		let queryArray: string[] = [];
		if (query.includes(';')) {
			queryArray = query.split(';');
		} else if (query.includes(',')) {
			queryArray = query.split(',');
		} else {
			queryArray = [query];
		}
		const queryObject: any[] = [];
		queryArray.forEach((element) => {
			const [first, ...rest] = element.split('=');
			const keyValueList = [first, rest.join('=')];
			if (keyValueList.length === 2) {
				const value = keyValueList[1];
				const typeKeyList = keyValueList[0].split('.');
				if (typeKeyList.length === 2) {
					const type = typeKeyList[0];
					const key = typeKeyList[1];
					queryObject.push({
						type,
						key,
						value: value.replace(/(^'|'$)/g, ''),
					});
				}
			}
		});
		return queryObject;
	}

	public static isValidAddress(address: string, length = -1) {
		try {
			const decodeResult = fromBech32(address);
			if (length === -1) {
				return true;
			}
			if (decodeResult.data.length === length) {
				return true;
			}
		} catch (error) {
			return false;
		}
		return false;
	}

	public static isValidAccountAddress(address: string, prefix: string, length = -1) {
		try {
			const decodeResult = fromBech32(address);
			if (length === -1) {
				return true;
			}
			if (decodeResult.data.length === length && decodeResult.prefix === prefix) {
				return true;
			}
		} catch (error) {
			return false;
		}
		return false;
	}
}
