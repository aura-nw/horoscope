'use strict';

process.env.TEST = 'true';

import { Context, Errors, ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import FeegrantDb from '../../../../services/feegrant/feegrant-db.service';
import { ITransaction } from '../../../../entities';
import FeegrantTxHandler from '../../../../services/feegrant/feegrant-tx-handler.service';
import * as Data from './mock-data'
import _ from 'lodash';

describe('Test feegrant-db service', () => {
    const broker = new ServiceBroker({ logger: false });
    const feegrantDbService = broker.createService(FeegrantDb)
    beforeEach(async () => {
        await feegrantDbService.adapter.insertMany([
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Fail",
                "origin_feegrant_txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "expiration": null
            },
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "expired": false,
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null
            },
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "expired": false,
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2022-10-08T03:20:14Z")
            },
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "expired": false,
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:13:50Z"),
                "tx_hash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null
            },
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "expired": false,
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:17:44Z"),
                "tx_hash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null
            },
            {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "expired": false,
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2025-10-04T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": new Date("2025-10-05T03:08:33Z")
            },
        ])
    })
    afterEach(async () => {
        await feegrantDbService.adapter.removeMany({});
    })
    beforeAll(async () => {
        await broker.start();
        await feegrantDbService.getQueue('feegrant-check-expire.db').empty()
    });
    afterAll(async () => {
        await broker.stop()
    });
    it("test check expire cronjob", async () => {
        await feegrantDbService.handleJobCheckExpire()
        const results = await feegrantDbService.adapter.find({})
        //@ts-ignore
        expect(results.map(result => {
            return _.omit(result.toObject(), ["_id"])
        }).sort(compare)).toEqual([
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Fail",
                "origin_feegrant_txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "expiration": null,
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2022-10-08T03:20:14Z"),
                "expired": true
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:13:50Z"),
                "tx_hash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:17:44Z"),
                "tx_hash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2025-10-04T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": new Date("2025-10-05T03:08:33Z"),
                "expired": false
            },
        ].sort(compare))
    })


    it("test update use actions", async () => {
        await feegrantDbService.handleJob([{
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "use",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "800"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "use",
            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "1000"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "use",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "500"
            },
            "expiration": null
        }])
        const results = await feegrantDbService.adapter.find({})
        //@ts-ignore
        expect(results.map(result => {
            return _.omit(result.toObject(), ["_id"])
        }).sort(compare)).toEqual([
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Fail",
                "origin_feegrant_txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "expiration": null,
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2022-10-08T03:20:14Z"),
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:13:50Z"),
                "tx_hash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:17:44Z"),
                "tx_hash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "700"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2025-10-04T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2025-10-05T03:08:33Z"),
                "expired": false
            },
        ].sort(compare))
    })


    it("test update revoke actions", async () => {
        await feegrantDbService.handleJob([{
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "use",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "800"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "revoke",
            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "1000"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "revoke",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "500"
            },
            "expiration": null
        }])
        const results = await feegrantDbService.adapter.find({})
        //@ts-ignore
        expect(results.map(result => {
            return _.omit(result.toObject(), ["_id"])
        }).sort(compare)).toEqual([
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Fail",
                "origin_feegrant_txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "expiration": null,
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2022-10-08T03:20:14Z"),
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:13:50Z"),
                "tx_hash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:17:44Z"),
                "tx_hash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                "status": "Revoked",
                "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1200"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2025-10-04T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Revoked",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": new Date("2025-10-05T03:08:33Z"),
                "expired": false
            },
        ].sort(compare))
    })

    it("test update use up actions", async () => {
        await feegrantDbService.handleJob([{
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "use",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Use up",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "800"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "revoke",
            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Available",
            "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "1000"
            },
            "expiration": null
        },
        {
            "custom_info": {
                "chain_id": "euphoria-1",
                "chain_name": "Aura Euphoria"
            },
            "action": "revoke",
            "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            "result": true,
            "timestamp": new Date("2022-10-05T02:55:47Z"),
            "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
            "type": "",
            "status": "Use up",
            "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
            "__v": 0,
            "amount": {
                "denom": "ueaura",
                "amount": "500"
            },
            "expiration": null
        }])
        const results = await feegrantDbService.adapter.find({})
        //@ts-ignore
        expect(results.map(result => {
            return _.omit(result.toObject(), ["_id"])
        }).sort(compare)).toEqual([
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Fail",
                "origin_feegrant_txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "3000"
                },
                "expiration": null,
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "expiration": new Date("2022-10-08T03:20:14Z"),
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:13:50Z"),
                "tx_hash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                "status": "Available",
                "origin_feegrant_txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "timestamp": new Date("2022-10-27T03:17:44Z"),
                "tx_hash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                "status": "Use up",
                "origin_feegrant_txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "1200"
                },
                "expiration": null,
                "expired": false
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2025-10-04T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Revoked",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": new Date("2025-10-05T03:08:33Z"),
                "expired": false
            },
        ].sort(compare))
    })

})

function compare(a: any, b: any) {
    if (a.tx_hash < b.tx_hash) {
        return -1;
    }
    if (a.tx_hash > b.tx_hash) {
        return 1;
    }
    if (a.tx_hash == b.tx_hash) {
        if (a.action > b.action) return 1
        else return -1
    }
    return 0;
}