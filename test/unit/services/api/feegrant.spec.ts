'use strict';

process.env.TEST = 'true';
import { Context, ServiceBroker } from 'moleculer';
import _ from 'lodash';
import FeegrantApi from '../../../../services/api-service/feegrant.service';
import { ErrorCode, ErrorMessage } from '../../../../types';
import { FEEGRANT_STATUS } from '../../../../common/constant';
describe('Test feegrant api', () => {
    const broker = new ServiceBroker({ logger: false });
    const feegrantApiService = broker.createService(FeegrantApi)
    beforeAll(async () => {
        broker.start()
        await feegrantApiService.adapter.insertMany([
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
                "expired": true,
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
                "action": "create",
                "expired": false,
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
                "action": "create",
                "expired": false,
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-04T03:08:33Z"),
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
                "expiration": null
            }, {
                "_id": null,
                "custom_info": {
                    "chain_id": "euphoria-1",
                    "chain_name": "Aura Euphoria"
                },
                "action": "create",
                "expired": true,
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                "result": true,
                "timestamp": new Date("2022-10-05T03:08:33Z"),
                "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                "status": "Revoked",
                "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                "__v": 0,
                "spend_limit": {
                    "denom": "ueaura",
                    "amount": "200"
                },
                "amount": {
                    "denom": "ueaura",
                    "amount": "2000"
                },
                "expiration": null
            }
        ])
    });
    afterAll(async () => {
        await feegrantApiService.adapter.removeMany({})
        broker.stop()
    });

    it("test get grant by granter and grantee", async () => {
        const params = {
            granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
            grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
            chainid: "euphoria-1",
            expired: false,
            status: FEEGRANT_STATUS.AVAILABLE,
            pageLimit: 10,
            pageOffset: 0,
            nextKey: null
        }
        const result = JSON.parse(JSON.stringify(await feegrantApiService.getGrants({ params })))
        result.data.grants = result.data.grants.sort(compare)
        //@ts-ignore
        result.data.grants = result.data.grants.map((grant: any) => {
            return _.omit(grant, ["_id"])

        })
        //@ts-ignore
        result.data = _.omit(result.data, ["nextKey"])
        expect(result).toEqual({
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data: {
                grants: [
                    {
                        "custom_info": {
                            "chain_id": "euphoria-1",
                            "chain_name": "Aura Euphoria"
                        },
                        "action": "create",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "result": true,
                        "expired": false,
                        "timestamp": new Date("2022-10-05T03:08:33Z").toISOString(),
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
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "result": true,
                        "timestamp": new Date("2022-10-04T03:08:33Z").toISOString(),
                        "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAfake",
                        "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "status": "Available",
                        "expired": false,
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
                        "expiration": null
                    }
                ].sort(compare),
                count: 2,
            }
        })
    })
    it("test get grant by expire and status", async () => {
        const params = {
            chainid: "euphoria-1",
            expired: true,
            status: FEEGRANT_STATUS.FAIL + "," + FEEGRANT_STATUS.REVOKED,
            pageLimit: 10,
            pageOffset: 0,
            nextKey: null
        }
        const result = JSON.parse(JSON.stringify(await feegrantApiService.getGrants({ params })))
        result.data.grants = result.data.grants.sort(compare)
        //@ts-ignore
        result.data.grants = result.data.grants.map((grant: any) => {
            return _.omit(grant, ["_id"])

        })
        //@ts-ignore
        result.data = _.omit(result.data, ["nextKey"])
        expect(result).toEqual({
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data: {
                grants: [
                    {
                        "custom_info": {
                            "chain_id": "euphoria-1",
                            "chain_name": "Aura Euphoria"
                        },
                        "action": "create",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                        "result": false,
                        "expired": true,
                        "timestamp": new Date("2022-10-07T03:58:02Z").toISOString(),
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
                        "expired": true,
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "result": true,
                        "timestamp": new Date("2022-10-05T03:08:33Z").toISOString(),
                        "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "status": "Revoked",
                        "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "__v": 0,
                        "spend_limit": {
                            "denom": "ueaura",
                            "amount": "200"
                        },
                        "amount": {
                            "denom": "ueaura",
                            "amount": "2000"
                        },
                        "expiration": null
                    }
                ].sort(compare),
                count: 2
            },
        })
    })
    it("test get grant by original txhash", async () => {
        const params = {
            chainid: "euphoria-1",
            txhash: "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
            expired: true,
            pageLimit: 10,
            pageOffset: 0,
            nextKey: null
        }
        const result = JSON.parse(JSON.stringify(await feegrantApiService.getGrants({ params })))
        result.data.grants = result.data.grants.sort(compare)
        //@ts-ignore
        result.data.grants = result.data.grants.map((grant: any) => {
            return _.omit(grant, ["_id"])

        })
        //@ts-ignore
        result.data = _.omit(result.data, ["nextKey"])
        expect(result).toEqual({
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data: {
                grants: [
                    {
                        "custom_info": {
                            "chain_id": "euphoria-1",
                            "chain_name": "Aura Euphoria"
                        },
                        "action": "create",
                        "expired": true,
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "result": true,
                        "timestamp": new Date("2022-10-05T03:08:33Z").toISOString(),
                        "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "status": "Revoked",
                        "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "__v": 0,
                        "spend_limit": {
                            "denom": "ueaura",
                            "amount": "200"
                        },
                        "amount": {
                            "denom": "ueaura",
                            "amount": "2000"
                        },
                        "expiration": null
                    }
                ].sort(compare),
                count: 1
            },
        })
    })

    it("test get inactive grants", async () => {
        const params = {
            chainid: "euphoria-1",
            granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
        }
        const result = JSON.parse(JSON.stringify(await feegrantApiService.getGrantsInactive({ params })))
        result.data.grants = result.data.grants.sort(compare)
        //@ts-ignore
        result.data.grants = result.data.grants.map((grant: any) => {
            return _.omit(grant, ["_id"])

        })
        //@ts-ignore
        result.data = _.omit(result.data, ["nextKey"])
        expect(result).toEqual({
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data: {
                grants: [
                    {
                        "custom_info": {
                            "chain_id": "euphoria-1",
                            "chain_name": "Aura Euphoria"
                        },
                        "action": "create",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                        "result": false,
                        "expired": true,
                        "timestamp": new Date("2022-10-07T03:58:02Z").toISOString(),
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
                        "expired": true,
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "result": true,
                        "timestamp": new Date("2022-10-05T03:08:33Z").toISOString(),
                        "tx_hash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "status": "Revoked",
                        "origin_feegrant_txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8Dfake1",
                        "__v": 0,
                        "spend_limit": {
                            "denom": "ueaura",
                            "amount": "200"
                        },
                        "amount": {
                            "denom": "ueaura",
                            "amount": "2000"
                        },
                        "expiration": null
                    }
                ].sort(compare),
                count: 2
            },
        })
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