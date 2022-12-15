/* eslint-disable max-classes-per-file */

import CID from 'cids';
import parse from 'parse-uri';
import { Types } from 'mongoose';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import moleculer, { Context } from 'moleculer';
import axios from 'axios';

import * as FileType from 'file-type';
import BigNumber from 'bignumber.js';
import { LIST_NETWORK } from '../../common/constant';
import { S3Service } from '../../utils/s3';
import { Config } from '../../common';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createHash } = require('crypto');

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const BUCKET = Config.BUCKET;
const FILE_TYPE_VALID = Config.FILE_TYPE_VALID;
const REQUEST_IPFS_TIMEOUT = Config.REQUEST_IPFS_TIMEOUT;
const MAX_CONTENT_LENGTH_BYTE = parseInt(Config.MAX_CONTENT_LENGTH_BYTE, 10);
const MAX_BODY_LENGTH_BYTE = parseInt(Config.MAX_BODY_LENGTH_BYTE, 10);
const s3Client = new S3Service().connectS3();
const IPFS_GATEWAY = Config.IPFS_GATEWAY;
const IPFS_PREFIX = 'ipfs';

interface ICW4973AssetInfo {
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
}

interface ICW721AssetInfo {
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
}

interface ICW20BalanceInfo {
	data: {
		balance: string;
	};
}

interface ICW20AssetInfo {
	data: {
		name: string;
		symbol: string;
		decimals: number;
		total_supply: string;
	};
}

export interface ITokenInfo {
	url: string;
	chainId: string;
	codeId: number;
	address: string;
	tokenId: string;
	owner: string;
}

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'asset-common',
	version: 1,
	mixins: [new CallApiMixin().start()],
})
export default class CommonService extends moleculer.Service {
	@Action({ name: 'getContractListByCodeID' })
	private async _getContractListByCodeID(ctx: Context<ITokenInfo>) {
		const url = ctx.params.url;
		const codeId = ctx.params.codeId;
		const contractList: any[] = [];
		const urlGetContractList = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let path = `${CODE_ID_URI}${codeId}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
		let nextKey = null;
		do {
			const resultCallApi = await this.callApiFromDomain(url, path);
			if (resultCallApi?.contracts?.length > 0) {
				contractList.push(...resultCallApi.contracts);
				nextKey = resultCallApi.pagination.next_key;
				if (nextKey === null) {
					break;
				}
				path = `${urlGetContractList}pagination.key=${encodeURIComponent(nextKey)}`;
			} else {
				this.logger.error('Call urlGetContractList return error', path);
			}
		} while (nextKey != null);
		return contractList;
	}
}

export class Common {
	public static getKeyFromUri(uri: string) {
		const parsed = parse(uri);
		let uriHandled = '';
		let fileName = '';
		let mediaLinkKey = '';
		let type = '';
		if (parsed.protocol === IPFS_PREFIX) {
			type = 'IPFS';
			const cid = parsed.host;
			const cidBase32 = new CID(cid).toV1().toString('base32');
			uriHandled = `${IPFS_GATEWAY}${cidBase32}`;
			if (!cid.startsWith('Qm') && parsed.path) {
				uriHandled += `${parsed.path}`;
			}
			fileName = cid;
			mediaLinkKey = cid;
		} else {
			type = 'HTTP';
			uriHandled = uri;
			fileName = uri.replace(/^.*[\\\/]/, '');
			mediaLinkKey = Common.hash(uri);
		}
		return [uriHandled, type, fileName, mediaLinkKey];
	}

	public static createCW4973AssetObject(
		codeId: string,
		address: string,
		id: string,
		mediaLinkKey: string,
		tokenInfo: ICW721AssetInfo,
		chainId: string,
		metadata: unknown,
	) {
		const network = LIST_NETWORK.find((item) => item.chainId === chainId);
		/* eslint-disable camelcase */
		return {
			_id: Types.ObjectId(),

			asset_id: `${address}_${id}`,
			code_id: codeId,
			asset_info: tokenInfo,
			contract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			media_link: mediaLinkKey,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			is_burned: false,
			metadata,
		};
		/* eslint-enable camelcase */
	}
	public static createCW721AssetObject(
		codeId: string,
		address: string,
		id: string,
		mediaLinkKey: string,
		tokenInfo: ICW721AssetInfo,
		chainId: string,
		metadata: unknown,
	) {
		const network = LIST_NETWORK.find((item) => item.chainId === chainId);
		/* eslint-disable camelcase */
		return {
			_id: Types.ObjectId(),
			asset_id: `${address}_${id}`,
			code_id: codeId,
			asset_info: tokenInfo,
			contract_address: address,
			token_id: id,
			owner: tokenInfo.data.access.owner,
			media_link: mediaLinkKey,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			is_burned: false,
			metadata,
		};
		/* eslint-enable camelcase */
	}
	public static createCW20AssetObject(
		codeId: string,
		address: string,
		owner: string,
		tokenInfo: ICW20AssetInfo,
		balanceInfo: ICW20BalanceInfo,
		chainId: string,
	) {
		const network = LIST_NETWORK.find((item) => item.chainId === chainId);
		/* eslint-disable camelcase */
		return {
			_id: Types.ObjectId(),
			asset_id: `${address}_${owner}`,
			code_id: codeId,
			asset_info: tokenInfo,
			contract_address: address,
			owner,
			balance: balanceInfo?.data?.balance,
			history: [],
			custom_info: {
				chain_id: network?.chainId,
				chain_name: network?.chainName,
			},
			// Percent_hold:
			// 	Number(
			// 		(BigInt(balanceInfo?.data?.balance) * BigInt(100000000)) /
			// 			BigInt(tokenInfo?.data?.total_supply),
			// 	) / 1000000,
			percent_hold: new BigNumber(balanceInfo?.data?.balance)
				.dividedBy(tokenInfo?.data?.total_supply)
				.multipliedBy(100),
		};
		/* eslint-enable camelcase */
	}
	public static checkFileTypeInvalid(type: string) {
		// Return (type.match("text/*") || type.match("image/*") || type.match("video/*")) ? true : false;
		return type.match(FILE_TYPE_VALID) ? true : false;
	}

	public static hash(str: string) {
		return createHash('sha256').update(str).digest('hex');
	}

	public static handleUri = async (uri: string, typeUri: string, fileName: string) => {
		if (Common.validURI(uri)) {
			const uploadAttachmentToS3 = async (type: any, buffer: any) => {
				const params = {
					// File name you can get from url or in any other way, you could then pass it as parameter to the function for example if necessary
					Key: fileName,
					Body: buffer,
					Bucket: BUCKET,
					ContentType: type,
					//   ACL: 'public-read' //becomes a public url
				};
				// Notice use of the upload function, not the putObject function
				return s3Client
					.upload(params)
					.promise()
					.then(
						(response) => ({
							linkS3: response.Location,
							contentType: type,
							key: response.Key,
						}),
						(err) => {
							throw new Error(err);
						},
					);
			};

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
			new URL(str);
		} catch (error) {
			return false;
		}
		return true;
	}
	public static makeid() {
		let text = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (let i = 0; i < 5; i++) {
			text += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		return text;
	}

	public static updateBase64InUrl(base64: string) {
		return base64.replace(/\+/g, '-').replace(/\//g, '_');
	}
}
