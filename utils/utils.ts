import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../common/constant';
import { fromBech32 } from '@cosmjs/encoding';
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

	public static formatSearchQueryInTxSearch(query: string) {
		let queryArray: string[] = [];
		if (query.includes(';')) {
			queryArray = query.split(';');
		} else if (query.includes(',')) {
			queryArray = query.split(',');
		} else {
			queryArray = [query];
		}
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
						value: value.replace(/(^'|'$)/g, ''),
					});
				}
			}
		});
		return queryObject;
	}

	public static isValidAddress(address: string, length: number = -1) {
		try {
			let decodeResult = fromBech32(address);
			if (length == -1) {
				return true;
			}
			if (decodeResult.data.length == length) {
				return true;
			}
		} catch (error) {
			return false;
		}
		return false;
	}
}
