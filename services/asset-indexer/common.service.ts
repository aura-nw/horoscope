'use strict';

import CallApiMixin from "@Mixins/callApi/call-api.mixin";
// import http, { request } from "http";
import request from "request-promise";
// import fs from "fs";
// import parse from "url-parse";
// import Url from "url-parse";
// import File from "typescript";
import CID from 'cids';
const fetch = require("node-fetch");

// const fileTypeFromBuffer = require ("file-type");
// import fileTypeFromBuffer from 'file-type';
// import fileTypeFromBuffer, { fileType, FileTypeResult } from "file-type";
// import fileTypeFromFile from "file-type";
// import * as FileType from "file-type";
import parse from "parse-uri";
import { Config } from "common";
import { Types } from "mongoose";
// import fetch from "node-fetch";
// import { fetch } from 'cross-fetch';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import moleculer, { Context } from "moleculer";
import { S3Service } from '../../utils/s3';
// import { IPFS } from '../../utils/ipfs';

const CODE_ID_URI = Config.CODE_ID_URI;
const CONTRACT_URI_LIMIT = Config.ASSET_INDEXER_CONTRACT_URI_LIMIT;
const BUCKET = Config.BUCKET;
const callApiMixin = new CallApiMixin().start();
const s3Client = new S3Service().connectS3();
const IPFS_GATEWAY = "https://ipfs.io/ipfs/";
const IPFS_PREFIX = "ipfs";

type CW721AssetInfo = {
    data: {
        access: {
            owner: String;
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
    mixins: [callApiMixin]
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
                // @ts-ignore
                this.logger.error('Call urlGetContractList return error', path);
            }
        } while (next_key != null);
        return contractList;
    }

    private async getFile(ctx: Context<TokenInfo>) {
        // const URL = ctx.params.URL;
        // const code_id = ctx.params.code_id;
        // let contractList: any[] = [];
        // const urlGetContractList = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
        // let path = `${CODE_ID_URI}${code_id}/contracts?pagination.limit=${CONTRACT_URI_LIMIT}&pagination.countTotal=true&`;
        // let next_key = null;
        // do {
        // @ts-ignore
        let resultCallApi = await this.callApiFromDomain("ipfs.io/", "api/v0/file/ls?arg=QmUpd48SunBdGRgYEdCMgwDY4NdnSTmt5UnNcEqbDytZWt");
        this.logger.info('Call resultCallApi return ', resultCallApi);
        // if (resultCallApi?.contracts?.length > 0) {
        //     contractList.push(...resultCallApi.contracts);
        //     next_key = resultCallApi.pagination.next_key;
        //     if (next_key === null) {
        //         break;
        //     }
        //     path = `${urlGetContractList}pagination.key=${encodeURIComponent(next_key)}`;
        // } else {
        //     // @ts-ignore
        // }
        // } while (next_key != null);
        return "";
    }
}

export class Common {
    public static createCW721AssetObject = function (code_id: Number, address: String, id: String, tokenInfo: CW721AssetInfo) {
        return {
            _id: new Types.ObjectId(),
            asset_id: `${address}_${id}`,
            code_id: code_id,
            asset_info: tokenInfo,
            constract_address: address,
            token_id: id,
            owner: tokenInfo.data.access.owner,
            history: [],
        };
    }
    public static createCW20AssetObject = function (code_id: Number, address: String, owner: String, tokenInfo: CW20AssetInfo, balanceInfo: CW20BalanceInfo) {
        return {
            _id: new Types.ObjectId(),
            asset_id: `${address}_${owner}`,
            code_id: code_id,
            asset_info: tokenInfo,
            constract_address: address,
            owner: owner,
            balance: balanceInfo?.data?.balance,
            history: [],
        };
    }

    public static getFileFromUrl = async function (url: string) {
        let parsed = parse(url);
        console.log(parsed);
        if (parsed.protocol === IPFS_PREFIX) {
            const cid = parsed.host;
            const cidBase32 = new CID(cid).toV1().toString('base32');
            const uri = `${IPFS_GATEWAY}${cidBase32}`;
            var options = {
                uri,
                encoding: null,
            };
            request(options, async function (error: any, response: any, body: any) {
                if (error || response.statusCode !== 200) {
                    console.log("failed to get image");
                    console.log(error);
                } else {
                    s3Client.putObject({
                        Body: body,
                        Key: cid,
                        Bucket: BUCKET,
                        ContentType: response.headers['content-type'],
                    }, function (error: any) {
                        if (error) {
                            console.log("error downloading image to s3", error);
                            return "";
                        } else {
                            const linkS3 = `https://${BUCKET}.s3.amazonaws.com/${cid}`
                            console.log("success uploading to s3", linkS3);
                            return linkS3;
                        }
                    });
                }
            });
        }

    }
}
