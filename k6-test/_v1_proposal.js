/*
 * Horoscope API Documentation
 * ## Indexer for multiple Cosmos Network   ### How to use  Select server Horoscope if use Horoscope API  Select server LCD if use Legacy API
 *
 * OpenAPI spec version: 1.0.0
 *
 * NOTE: This class is auto generated by OpenAPI Generator.
 * https://github.com/OpenAPITools/openapi-generator
 *
 * OpenAPI generator version: 6.1.0-SNAPSHOT
 */


import http from "k6/http";
import { group, check, sleep } from "k6";
import { randomItem, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// const BASE_URL = "https://indexer.dev.aurascan.io/api";
const BASE_URL = "https://indexer-test.dev.aurascan.io/api";
// Sleep duration between successive requests.
// You might want to edit the value of this variable or remove calls to the sleep function on the script.
const SLEEP_DURATION = 0.1;
// Global variables should be initialized.
// const CHAIN_ID = "euphoria-1"
const CHAIN_ID = "serenity-testnet-001"
const PAGE_LIMIT = "100"
const PAGE_OFFSET = "1"
const OPERATOR_ADDRESS = "euphoria-1"
const CONTRACT_TYPE = "CW721"
const address = JSON.parse(open("./data/account_serenity.json"));
const validator_status = JSON.parse(open("./data/validator_status.json"));
const module = JSON.parse(open("./data/module.json"));
const contractAddressList = JSON.parse(open("./data/contract.json"));

export const options = {
    // vus: 10,
    // iterations: 10,
    stages: [
        { target: 100, duration: '5s' },
        { target: 150, duration: '10s' },
        { target: 200, duration: '15s' },
        { target: 250, duration: '20s' },
        { target: 300, duration: '25s' },
      ],
};

export default function () {
    group("/v1/proposal", () => {
        let pageLimit = '20'; // 
        let chainid = CHAIN_ID; // 
        let pageOffset = ''; // 
        let nextKey = ''; // 
        let reverse = 'true'; // 
        let proposalId = randomIntBetween(1,20); // 

        // Request No. 1
        {
            let url = BASE_URL + `/v1/proposal?chainid=${chainid}`;
            if (pageOffset != '') {
                url = url + `&pageOffset=${pageOffset}`;
            }
            if (pageLimit != '') {
                url = url + `&pageLimit=${pageLimit}`;
            }
            if (nextKey != '') {
                url = url + `&nextKey=${nextKey}`;
            }
            if (reverse != '') {
                url = url + `&reverse=${reverse}`;
            }
            if (proposalId != '') {
                url = url + `&proposalId=${proposalId}`;
            }

            let request = http.get(url);

            // console.log(request);
            check(request, {
                "Register result": (r) => r.status === 200
            });
        }
    });
}
