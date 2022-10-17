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
const axios = require('axios').default;
import * as FileType from 'file-type';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const BUCKET = Config.BUCKET;
const FILE_TYPE_VALID = Config.FILE_TYPE_VALID;
const REQUEST_IPFS_TIMEOUT = Config.REQUEST_IPFS_TIMEOUT;
const callApiMixin = new CallApiMixin().start();
const s3Client = new S3Service().connectS3();
const IPFS_GATEWAY = Config.IPFS_GATEWAY;
const IPFS_PREFIX = 'ipfs';

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
		const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let next_key = null;
		do {
			// @ts-ignore
			let resultCallApi = await this.callApiFromDomain(URL, path);
			if (resultCallApi?.contracts?.length > 0) {
				contractList.push(...resultCallApi.contracts);
				next_key = resultCallApi.pagination.next_key;
				if (next_key === null) {
					break;
				}
				path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
			} else {
				this.logger.error('Call urlGetContractList return error', path);
			}
		} while (next_key != null);
		return contractList;
	}
}

export class Common {
	public static getKeyFromUri(uri: string) {
		let parsed = parse(uri);
		let uri_handled = '';
		let file_name = '';
		let media_link_key = '';
		if (parsed.protocol === IPFS_PREFIX) {
			const cid = parsed.host;
			const cidBase32 = new CID(cid).toV1().toString('base32');
			uri_handled = `${IPFS_GATEWAY}${cidBase32}`;
			if (!cid.startsWith('Qm') && parsed.path) {
				uri_handled += `${parsed.path}`;
			}
			file_name = cid;
			media_link_key = cid;
		} else {
			uri_handled = uri;
			file_name = uri.replace(/^.*[\\\/]/, '');
			media_link_key = Common.hash(uri);
		}
		return [uri_handled, file_name, media_link_key];
	}

	public static createCW721AssetObject = function (
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

	public static handleUri = async (uri: string, file_name: string) => {
		let errcode = 0;
		if (Common.validURI(uri)) {
			var _include_headers = function (
				body: any,
				response: { headers: any },
				resolveWithFullResponse: any,
			) {
				return { headers: response.headers, data: body };
			};
			var options = {
				uri,
				encoding: null,
				json: true,
				transform: _include_headers,
				resolveWithFullResponse: true,
				timeout: REQUEST_IPFS_TIMEOUT,
			};
			const rs = new Promise(async (resolve, reject) => {
				request(options)
					.then(function (response: any) {
						const contentType = response.headers['content-type'];
						if (Common.checkFileTypeInvalid(contentType)) {
							s3Client.putObject(
								{
									Body: response.data,
									Key: file_name,
									Bucket: BUCKET,
									ContentType: contentType,
								},
								function (error: any) {
									if (error) {
										reject(error);
									} else {
										const linkS3 = `https://${BUCKET}.s3.amazonaws.com/${file_name}`;
										resolve(linkS3);
									}
								},
							);
						}
					})
					.catch(function (err: any) {
						errcode = err.error.code;
						reject(err);
					});
			});
			return rs;
			// async function uploadAttachmentToS3(type: any, buffer: any) {
			// 	var params = {
			// 		//file name you can get from URL or in any other way, you could then pass it as parameter to the function for example if necessary
			// 		Key: file_name,
			// 		Body: buffer,
			// 		Bucket: BUCKET,
			// 		ContentType: type,
			// 		//   ACL: 'public-read' //becomes a public URL
			// 	};
			// 	//notice use of the upload function, not the putObject function
			// 	return s3Client
			// 		.upload(params)
			// 		.promise()
			// 		.then(
			// 			(response) => {
			// 				return response.Location;
			// 			},
			// 			(err) => {
			// 				return { type: 'error', err: err };
			// 			},
			// 		);
			// }

			// async function downloadAttachment(url: any) {
			// 	return axios
			// 		.get(url, {
			// 			responseType: 'arraybuffer',
			// 		})
			// 		.then((response: any) => {
			// 			const buffer = Buffer.from(response.data, 'base64');
			// 			return (async () => {
			// 				let type = (await FileType.fromBuffer(buffer))?.mime;
			// 				return uploadAttachmentToS3(type, buffer);
			// 			})();
			// 		})
			// 		.catch((err: any) => {
			// 			return { type: 'error', err: err };
			// 		});
			// }
			// return await downloadAttachment(uri);
		} else {
			throw new Error('InvalidURI');
		}
	};

	public static validURI(str: string) {
		var pattern = new RegExp(
			'^(https?:\\/\\/)?' + // protocol
				'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
				'((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
				'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
				'(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
				'(\\#[-a-z\\d_]*)?$',
			'i',
		); // fragment locator
		return !!pattern.test(str);
	}
	public static makeid() {
		var text = '';
		var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < 5; i++)
			text += possible.charAt(Math.floor(Math.random() * possible.length));

		return text;
	}
}
