'use strict';

import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import request from 'request-promise';
import CID from 'cids';
const fetch = require('node-fetch');
import parse from 'parse-uri';
import { Config } from '../../common';
import { Types } from 'mongoose';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import moleculer, { Context } from 'moleculer';
import { S3Service } from '../../utils/s3';
import { LIST_NETWORK } from '../../common/constant';
const { createHash } = require('crypto');
const errors = require('request-promise/errors');
import { AxiosDefaults } from 'axios';
import axios from 'axios';

import * as FileType from 'file-type';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const BUCKET = Config.BUCKET;
const FILE_TYPE_VALID = Config.FILE_TYPE_VALID;
const REQUEST_IPFS_TIMEOUT = Config.REQUEST_IPFS_TIMEOUT;
const MAX_CONTENT_LENGTH_BYTE = parseInt(Config.MAX_CONTENT_LENGTH_BYTE, 10);
const MAX_BODY_LENGTH_BYTE = parseInt(Config.MAX_BODY_LENGTH_BYTE, 10);
const callApiMixin = new CallApiMixin().start();
const s3Client = new S3Service().connectS3();
const IPFS_GATEWAY = Config.IPFS_GATEWAY;
const IPFS_PREFIX = 'ipfs';

type CW4973AssetInfo = {
	data: {
		access: {
			approvals: [];
			owner: string;
		};
		info: {
			token_uri: string;
			extension: string;
		};
	};
};

type CW721AssetInfo = {
	data: {
		access: {
			approvals: [];
			owner: string;
		};
		info: {
			token_uri: string;
			extension: string;
		};
	};
};

type CW20BalanceInfo = {
	data: {
		balance: string;
	};
};

type CW20AssetInfo = {
	data: {
		name: string;
		symbol: string;
		decimals: number;
		total_supply: string;
	};
};

export type TokenInfo = {
	URL: string;
	chain_id: string;
	code_id: number;
	address: string;
	token_id: string;
	owner: string;
};

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset-common',
	version: 1,
	mixins: [callApiMixin],
})
export default class CommonService extends moleculer.Service {
	@Action()
	private async getContractListByCodeID(ctx: Context<TokenInfo>) {
		const URL = ctx.params.URL;
		const code_id = ctx.params.code_id;
		let contractList: any[] = [];
		// const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		// let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		// let next_key = null;
		// do {
		// 	// @ts-ignore
		// 	let resultCallApi = await this.callApiFromDomain(URL, path);
		// 	if (resultCallApi?.contracts?.length > 0) {
		// 		contractList.push(...resultCallApi.contracts);
		// 		next_key = resultCallApi.pagination.next_key;
		// 		if (next_key === null) {
		// 			break;
		// 		}
		// 		path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
		// 	} else {
		// 		this.logger.error('Call urlGetContractList return error', path);
		// 	}
		// } while (next_key != null);
		contractList.push(
			'aura1zqmk5rcncqh3fypswvy666cj6yv8k7h7gnezcfmwmy55u3mpeytqjh08z8',
			'aura1el9e9grelpnm6ahrs0hmtv9x626k2naexxk4xa0aceweunrq7jrs66q3qs',
			'aura1s4pndz0qksvu2y042ksxwuywhjc8w0ueqfwssmr4tmy7493yuwsspm9u0e',
			'aura1razqs87v9ucd4tjw07ant8n2rxpuh7gt8rs0svsrszfqref4wrtsz65lc6',
			'aura1ff5nzxkqe42qv48qwfedjt05l7kevkv9cl0c6njppwmau3txqz3sxs9nz9',
			'aura1j2asdmpe7tfpl5h8uv9435ass8lx9xnl5lf05h4ssf4t4t4lzphqud6f9f',
			'aura1rtg4v5k8g767s6yt6v46v6gc6t8ey78s6d8sj3pvhdleu5twdnaqhqaw93',
			'aura1a2scapkn8wqfsyys59nthm6jhgfwru9r8ru75zmcl8pdml8kg3xqkghgwn',
			'aura1n9qpd53qgygpf8zavk70ddjpqcwcdzfzm9x2v2g9ajfv0yxe77asndjacv',
			'aura1f2407u7xkdp6tt7jw4psv59my27z2hnsmpw83dctuqkll3h48f2q9mhgjs',
			'aura1z5xqqzp0yjuyyfjl4f4qv4uvw2rzrsmaunl83a2n5hq86ler8z0s5yuwqx',
			'aura1anuyyhshf24k8tt0na2aa2um9qsw3hu5j07klexsxdvtzfys09zsv9cgwc',
			'aura1mc5v3kfmkrknfj0gjqd2ehd8hwt8m8peqlqdp9tn209qqtdp8vmqpwy5ek',
			'aura10x26twvfuqtdzq2tdrvltdea7m0clc52kluwl903knj85svvu0rqdsyqgu',
			'aura1n6yedump9g2m6jhfpdve588f8uw99jpp0d5kn6syteqvw0rldecs92qa9x',
			'aura1qx65jfgmcl8vwawduus45vgepsxkhtzzn4t8g9r30nvhzd8x532qfdr9ge',
			'aura1ygn72zstx4sjuvhpdmv0ndhg9336xv2pfe2n36jz33e9x4k29ams93ypup',
			'aura1m0am6qg44vhmksyhz6nysmx8jsnd37ne4ak2z9ds448jqrap3s9q6ywvv8',
			'aura19gzwefj6z3h7ul8a5g2c5tnf8pgzywfxf4qrtn3jtgqnva72tens8gtf7y',
			'aura17cfpy0ucyjjlvhcma6c28hj2uhu8rmrej0yj47r0h88zhuwjrm0ssuzq50',
			'aura1a27at27nfxdx7wqf2calnk6l5spdqej0xzp8z02dsn8we02qrldqju4pzc',
			'aura1qf2gs22duxd9mzp5w8jfw2375yj68m2j9p55ahc593efr3zg3yeskjkvc7',
			'aura1mhp8sf49jgqjeslgffcy04p8wdmepne7szgzty3a7ulcqk9m6h8swcj7xn',
			'aura1tszlyztpe347qfy5d9rk9z7zl5nngnhhf55py07n3z9jctsjscjqtp2rz8',
			'aura14c7syrnrscja7gd4s9y4cthpdnrdvs4s6u5v9x7zmpzahk8p9ykq47vpvr',
			'aura1f78aufyvwe2ufthg5u9scg3la062k2gudx3rhgfewg0rmekrmqys2wc9lk',
			'aura18hns7rutpsklneaspjvt6fptu8mqrcaeflw74yju365xard7e4gqcmrt0w',
			'aura1us465tp7xhh7pqd7h328xcp5pw0ewlm2w4pmg202sfmhu42k9jcs6erezm',
			'aura1wuctkujxqnq85ddx4smmw8hm863gauqmsl3w74em86rr2jutzndqcunkwz',
			'aura109wsxn97f54gtescc0utv626wmkf6cuf6gzmzasrmfdq2xctewwszxe9yc',
		);
		return contractList;
	}
}

export class Common {
	public static getKeyFromUri(uri: string) {
		let parsed = parse(uri);
		let uri_handled = '';
		let file_name = '';
		let media_link_key = '';
		let type = '';
		let source_uri = '';
		if (parsed.protocol === IPFS_PREFIX) {
			type = 'IPFS';
			const cid = parsed.host;
			const cidBase32 = cid;
			// const cidBase32 = new CID(cid).toV1().toString('base32');
			uri_handled = `${IPFS_GATEWAY}${cidBase32}`;
			source_uri = `ipfs://${cid}`;
			if (!cid.startsWith('Qm') && parsed.path) {
				// uri_handled += `${parsed.path}`;
			}
			file_name = cid;
			media_link_key = cid;
		} else {
			type = 'HTTP';
			uri_handled = uri;
			file_name = uri.replace(/^.*[\\\/]/, '');
			media_link_key = Common.hash(uri);
		}
		return [uri_handled, type, file_name, media_link_key, source_uri];
	}

	public static createCW4973AssetObject = function (
		code_id: Number,
		address: String,
		id: String,
		media_link_key: String,
		tokenInfo: CW721AssetInfo,
		chainId: String,
	) {
		let network = LIST_NETWORK.find((item) => item.chainId === chainId);
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${id}`,
			code_id: code_id,
			asset_info: tokenInfo,
			contract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			media_link: media_link_key,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			is_burned: false,
		};
	};
	public static createCW721AssetObject = function (
		code_id: Number,
		address: String,
		id: String,
		media_link_key: String,
		tokenInfo: CW721AssetInfo,
		chainId: String,
		metadata: Object,
	) {
		let network = LIST_NETWORK.find((item) => item.chainId === chainId);
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${id}`,
			code_id: code_id,
			asset_info: tokenInfo,
			contract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			media_link: media_link_key,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			is_burned: false,
			metadata: metadata,
		};
	};
	public static createCW20AssetObject = function (
		code_id: Number,
		address: String,
		owner: String,
		tokenInfo: CW20AssetInfo,
		balanceInfo: CW20BalanceInfo,
		chainId: String,
	) {
		let network = LIST_NETWORK.find((item) => item.chainId === chainId);
		return {
			_id: new Types.ObjectId(),
			asset_id: `${address}_${owner}`,
			code_id: code_id,
			asset_info: tokenInfo,
			contract_address: address,
			owner: owner,
			balance: balanceInfo?.data?.balance,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			percent_hold:
				Number(
					(BigInt(balanceInfo?.data?.balance) * BigInt(100000000)) /
						BigInt(tokenInfo?.data?.total_supply),
				) / 1000000,
		};
	};
	public static checkFileTypeInvalid = function (type: string) {
		// return (type.match("text/*") || type.match("image/*") || type.match("video/*")) ? true : false;
		return type.match(FILE_TYPE_VALID) ? true : false;
	};

	public static hash(str: string) {
		return createHash('sha256').update(str).digest('hex');
	}

	public static handleUri = async (uri: string, type: string, file_name: string) => {
		let errcode = 0;
		if (Common.validURI(uri)) {
			// var _include_headers = function (
			// 	body: any,
			// 	response: { headers: any },
			// 	resolveWithFullResponse: any,
			// ) {
			// 	return { headers: response.headers, data: body };
			// };
			// var options = {
			// 	uri,
			// 	encoding: null,
			// 	json: true,
			// 	transform: _include_headers,
			// 	resolveWithFullResponse: true,
			// 	// timeout: REQUEST_IPFS_TIMEOUT,
			// };
			// const rs = new Promise(async (resolve, reject) => {
			// 	request(options)
			// 		.then(function (response: any) {
			// 			const contentType = response.headers['content-type'];
			// 			if (Common.checkFileTypeInvalid(contentType)) {
			// 				s3Client.putObject(
			// 					{
			// 						Body: response.data,
			// 						Key: file_name,
			// 						Bucket: BUCKET,
			// 						ContentType: contentType,
			// 					},
			// 					function (error: any) {
			// 						if (error) {
			// 							reject(error);
			// 						} else {
			// 							const linkS3 = `https://${BUCKET}.s3.amazonaws.com/${file_name}`;
			// 							resolve({linkS3, contentType});
			// 						}
			// 					},
			// 				);
			// 			}
			// 		})
			// 		.catch(function (err: any) {
			// 			errcode = err.error.code;
			// 			reject(err);
			// 		});
			// });
			// return rs;
			async function uploadAttachmentToS3(type: any, buffer: any) {
				var params = {
					//file name you can get from URL or in any other way, you could then pass it as parameter to the function for example if necessary
					Key: file_name,
					Body: buffer,
					Bucket: BUCKET,
					ContentType: type,
					//   ACL: 'public-read' //becomes a public URL
				};
				//notice use of the upload function, not the putObject function
				return s3Client
					.upload(params)
					.promise()
					.then(
						(response) => {
							return { linkS3: response.Location, contentType: type };
						},
						(err) => {
							throw new Error(err);
						},
					);
			}

			// async function downloadAttachment(url: any) {
			// 	const axiosClient = axios.create({
			// 		responseType: 'arraybuffer',
			// 		timeout: REQUEST_IPFS_TIMEOUT,
			// 		maxContentLength: MAX_CONTENT_LENGTH_BYTE,
			// 		maxBodyLength: MAX_BODY_LENGTH_BYTE,
			// 	});
			// 	return axiosClient.get(url).then((response: any) => {
			// 		const buffer = Buffer.from(response.data, 'base64');
			// 		return (async () => {
			// 			let type = (await FileType.fromBuffer(buffer))?.mime;
			// 			return uploadAttachmentToS3(type, buffer);
			// 		})();
			// 	});
			// }
			return this.downloadAttachment(uri).then(async (buffer) => {
				let type: any = (await FileType.fromBuffer(buffer))?.mime;
				if (type === 'application/xml') {
					type = 'image/svg+xml';
				}
				return uploadAttachmentToS3(type, buffer);
			});
		} else {
			return null;
		}
	};
	public static async downloadAttachment(url: any) {
		const axiosClient = axios.create({
			responseType: 'arraybuffer',
			timeout: REQUEST_IPFS_TIMEOUT,
			maxContentLength: MAX_CONTENT_LENGTH_BYTE,
			maxBodyLength: MAX_BODY_LENGTH_BYTE,
		});

		return axiosClient.get(url).then((response: any) => {
			const buffer = Buffer.from(response.data, 'base64');
			return buffer;
		});
	}
	public static async getFileTypeFromBuffer(buffer: Buffer) {
		return await FileType.fromBuffer(buffer);
	}

	public static validURI(str: string) {
		try {
			let url = new URL(str);
		} catch (error) {
			return false;
		}
		return true;
	}
	public static makeid() {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}

	public static updateBase64InUrl(base64: string) {
		return base64.replace(/\+/g, '-').replace(/\//g, '_');
	}
}
