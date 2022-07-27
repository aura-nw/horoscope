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
// import fileTypeFromFile from 'file-type';
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
    // public static loadIpfs = async function () {
    //     // const { create } = await import('ipfs-core');
    //     const node = await IPFS.create();
    //     return node
    // }
    public static getFileFromUrl = async function (url: string, name: string, defaultType = 'image/jpeg') {
        // const response = await fetch(url);
        // const data = await response.blob();
        // let blob = await fetch(url).then(r => r.blob());
        // return blob;
        // return new File([data], name, {
        //     type: data.type || defaultType,
        // });
        // const file = fs.createWriteStream("file.jpg");
        // await http.get("http://i3.ytimg.com/vi/J---aiyznGQ/mqdefault.jpg", function (response) {
        //     response.pipe(file);

        //     // after download completed close filestream
        //     file.on("finish", () => {
        //         file.close();
        //         console.log("Download Completed");
        //     });
        // });
        // //Upload S3
        // const type = file.originalname.substr(file.originalname.indexOf('.') + 1);
        // const s3FileName = nftImage.cid.toString().concat('.').concat(type);

        const s3Client = new S3Service().connectS3();

        // const uploadFile = {
        //     Bucket: BUCKET,
        //     Key: s3FileName,
        //     Body: file.buffer,
        //     ContentType: file.mimetype,
        // };

        // await s3Client.upload(uploadFile, async (error, data) => {
        //     if (error) {
        //         throw new CustomError(ErrorMap.INSERT_COLLECTION_ASSET_FAILED);
        //     }
        // }).promise();
        const urlx = "ipfs://QmUpd48SunBdGRgYEdCMgwDY4NdnSTmt5UnNcEqbDytZWt/104"
        let parsed = parse(urlx);
        console.log(parsed);
        const cidBase32 = new CID(parsed.host).toV1().toString('base32');
        // const ipfs = await Common.loadIpfs();
        // console.log(ipfs.ls(cidBase32));
        // const uri = `https://dweb.link/ipfs/${cidBase32}`;
        const uri = `https://dweb.link/ipfs/bafybeidakcbv2uxivbtrf53nabui6bcw2mdkbuwwlyr4qfev7cid3irtxu`;
        console.log(`https://dweb.link/ipfs/${cidBase32}`);
        var options = {
            uri,
            // uri: url,
            encoding: null
        };

        // parsed.set('protocol', 'https');
        // parsed.set('host', 'ipfs.io/ipfs');
        // console.log(parsed);
        // console.log(options.uri);
        // let URL = new Url(options.uri,false);
        // console.log(URL);
        // console.log(URL.origin);
        // URL.set('protocol', 'https:');
        // const cid = URL.host;
        // URL.set('host',  "ipfs.io/ipfs");
        // console.log(cid);
        // URL.set('pathname', "CID");
        // console.log(URL);
        // console.log(URL.protocol=="ipfs:");
        // console.log(URL.host);
        // var req = await fetch(uri, { method: 'HEAD' });
        // console.log(req.headers);
        // console.log(req.headers.get('content-type'));
        request(options, async function (error: any, response: { statusCode: number; }, body: any) {
            console.log("request get image");
            if (error || response.statusCode !== 200) {
                console.log("failed to get image");
                console.log(error);
            } else {
                console.log("request get image ok");
                // let rs = await fileTypeFromFile(body);
                // console.log( fileTypeFromBuffer(body));
                // const { ext, mime } = await FileType.fromBuffer(body) as FileTypeResult;

                // var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
                // const type = await fileTypeFromFile(body);
                // const type = await FileType.fileTypeFromFile(body);
                // const node = await IPFS.connectIPFS();
                s3Client.putObject({
                    Body: body,
                    Key: "e1.png",
                    Bucket: BUCKET,
                }, function (error: any, data: any) {
                    if (error) {
                        console.log("error downloading image to s3", error);
                    } else {
                        console.log("success uploading to s3", data);
                    }
                });
            }
        });
    }
}
