'use strict';

process.env.TEST = 'true';
import util from "util"
import _ from 'lodash';
import { ServiceBroker } from 'moleculer';
import { IFeegrant } from '../../../../entities';
import FeegrantDb from '../../../../services/feegrant-indexer/feegrant-db.service';
import FeegrantHistoryDb from '../../../../services/feegrant-indexer/feegrant-history-db.service';
import { Any } from "typeorm";
import { IFeegrantData } from "../../../../services/feegrant-indexer/feegrant-tx-handler.service";

describe('Test feegrant-history-db service', () => {
    const broker = new ServiceBroker({ logger: false });
    const feegrantDbService = broker.createService(FeegrantDb)
    const feegarntHistoryDbService = broker.createService(FeegrantHistoryDb);
    const mockInsert = jest.fn().mockImplementation((param) => {
        return Promise.resolve(feegrantDbService.actions.insert(param.entities)) as Promise<any>
    })

    // feegrantDbService.actions = { insert: mockInsert }
    beforeAll(async () => {
        broker.start()
        await feegarntHistoryDbService.waitForServices(['v1.db-feegrant'])
        await feegarntHistoryDbService.handleJob(sample, "")
    });
    afterAll(async () => {
        await Promise.all([feegarntHistoryDbService.adapter.removeMany({}), feegrantDbService.adapter.removeMany({})])
        broker.stop()
    });
    it("Test add new grant to feegrant DB", async () => {
        const results = await feegrantDbService.adapter.find({})

        //@ts-ignore
        expect(results.map(result => {
            return _.omit(result.toObject(), ["_id", "expired"])
        }).sort(compare)).toEqual([
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
                "expiration": null
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": false,
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
                "expiration": null
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
                "expiration": null
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
                "expiration": null
            }
        ].sort(compare))
    })

    it("Test add new actions to feegrant history DB", async () => {
        const results = await feegarntHistoryDbService.adapter.find({})

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
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "expired": false,
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
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "expired": false,
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
                "expiration": null
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
                "expired": false,
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
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "expired": false,
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
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "revoke",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-05T03:05:31Z"),
                "tx_hash": "F139DA992DFE6BFBBC29BFB93ED0981CF36A24ECC5325C0EBCF081C2A5E270DA",
                "type": "",
                "status": "Revoked",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
                },
                "expiration": null
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "use",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-05T02:55:47Z"),
                "tx_hash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
                "type": "",
                "status": "Available",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
                },
                "expiration": null
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "use",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:58:02Z"),
                "tx_hash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
                "type": "",
                "status": "Available",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
                },
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "3000"
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
                "expired": false,
                "timestamp": new Date("2022-10-07T02:49:43Z"),
                "tx_hash": "E22F876F4AF7F5FCAE1DF631A62EC84F82951B385F936023D88C71A8EA7CA550",
                "type": "",
                "status": "Use up",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "1600"
                },
                "expiration": null
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "use",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-07T03:20:14Z"),
                "tx_hash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
                "type": "",
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "1000"
                },
                "status": "Available",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
                },
                "expiration": null
            },
            {
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "use",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-10T03:30:33Z"),
                "tx_hash": "94F41B7F641E7FE272F7ABFF5989C9BA3240EF848A44294245BD923C86536C7A",
                "type": "",
                "status": "Available",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
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
                "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                "result": true,
                "expired": false,
                "timestamp": new Date("2022-10-10T03:30:33Z"),
                "tx_hash": "94F41B7F641E7FE272F7ABFF5989C9BA3240EF848A44294245BD923C86536C7A",
                "type": "",
                "status": "Revoked",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "200"
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
                "expired": false,
                "timestamp": new Date("2022-10-07T02:49:43Z"),
                "tx_hash": "E22F876F4AF7F5FCAE1DF631A62EC84F82951B385F936023D88C71A8EA7CA550",
                "type": "",
                "status": "Use up",
                "origin_feegrant_txhash": null,
                "__v": 0,
                "amount": {
                    "denom": "ueaura",
                    "amount": "1600"
                },
                "expiration": null
            }
        ].sort(compare))
    })
});


const sample = [{
    action: "create",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
    payer: "",
    result: true,
    timestamp: new Date("2022-10-05T03:08:33Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
    expiration: null,
    type: "/cosmos.feegrant.v1beta1.BasicAllowance",
    spend_limit: {
        "denom": "ueaura",
        "amount": "2000"
    },
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "revoke",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
    payer: "",
    result: true,
    timestamp: new Date("2022-10-05T03:05:31Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "F139DA992DFE6BFBBC29BFB93ED0981CF36A24ECC5325C0EBCF081C2A5E270DA",
    expiration: null,
    type: "",
    spend_limit: {},
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "use",
    granter: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
    grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
    result: true,
    timestamp: new Date("2022-10-05T02:55:47Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
    expiration: null,
    type: "",
    spend_limit: {},
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "_create",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
    payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
    result: false,
    timestamp: new Date("2022-10-07T03:58:02Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
    expiration: null,
    type: "/cosmos.feegrant.v1beta1.BasicAllowance",
    spend_limit: {
        "denom": "ueaura",
        "amount": "3000"
    },
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "useup",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
    payer: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    result: true,
    timestamp: new Date("2022-10-07T02:49:43Z"),
    amount: {
        "denom": "ueaura",
        "amount": "1600"
    },
    tx_hash: "E22F876F4AF7F5FCAE1DF631A62EC84F82951B385F936023D88C71A8EA7CA550",
    expiration: null,
    type: "",
    spend_limit: {},
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "_create",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
    payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
    result: true,
    timestamp: new Date("2022-10-07T03:20:14Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
    expiration: null,
    type: "/cosmos.feegrant.v1beta1.BasicAllowance",
    spend_limit: {
        "denom": "ueaura",
        "amount": "1000"
    },
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "_revoke",
    granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
    payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
    result: true,
    timestamp: new Date("2022-10-10T03:30:33Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "94F41B7F641E7FE272F7ABFF5989C9BA3240EF848A44294245BD923C86536C7A",
    expiration: null,
    type: "",
    spend_limit: {},
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "create",
    granter: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
    grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    payer: "",
    result: true,
    timestamp: new Date("2022-10-27T03:13:50Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
    expiration: null,
    type: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
    spend_limit: {
        "denom": "ueaura",
        "amount": "2000"
    },
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
},
{
    action: "create",
    granter: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
    grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
    payer: "",
    result: true,
    timestamp: new Date("2022-10-27T03:17:44Z"),
    amount: {
        "denom": "ueaura",
        "amount": "200"
    },
    tx_hash: "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
    expiration: null,
    type: "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
    spend_limit: {
        "denom": "ueaura",
        "amount": "2000"
    },
    custom_info: {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    expired: false
}] as IFeegrantData[]

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