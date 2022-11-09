'use strict';

process.env.TEST = 'true';

import { Context, Errors, ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { ITransaction } from '../../../../entities';
import FeegrantTxHandler from '../../../../services/feegrant/feegrant-tx-handler.service';
import * as Data from './mock-data'

describe('Test feegrant-tx-handler service', () => {
    const broker = new ServiceBroker({ logger: false });
    const service = broker.createService(FeegrantTxHandler);
    const listTx = Data.listTxFromPairGranterGrantee
    const mockFind = jest.fn(params =>
        Promise.resolve(listTx)
    );
    service.adapter.lean = jest.fn(params =>
        Promise.resolve([])
    );
    beforeAll(async () => await broker.start());
    afterAll(async () => await broker.stop());
    describe("Test filter", () => {
        it("Could filter create", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "create",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                payer: "",
                result: true,
                timestamp: "2022-10-05T03:08:33Z",
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
            }]);
        });
        it("Could filter revoke", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_revoke)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "revoke",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                payer: "",
                result: true,
                timestamp: "2022-10-05T03:05:31Z",
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
            }]);
        });
        it("Could filter use", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_use)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "use",
                granter: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                result: true,
                timestamp: "2022-10-05T02:55:47Z",
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
            }]);
        });
        it("Could filter create fail", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create_but_existed)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "_create",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                result: false,
                timestamp: "2022-10-07T03:58:02Z",
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
            }]);
        });
        it("Could filter use up", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_use_up)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "useup",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                payer: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                result: true,
                timestamp: "2022-10-07T02:49:43Z",
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
            }]);
        });
        it("Could filter create with feegrant", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create_with_feegrant)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "_create",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                result: true,
                timestamp: "2022-10-07T03:20:14Z",
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
            }]);
        });
        it("Could filter revoke with feegrant", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_revoke_with_feegrant)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "_revoke",
                granter: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                grantee: "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                payer: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                result: true,
                timestamp: "2022-10-10T03:30:33Z",
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
            }]);
        });
        it("Could filter create period", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create_period)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "create",
                granter: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                payer: "",
                result: true,
                timestamp: "2022-10-27T03:13:50Z",
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
            }]);
        });
        it("Could filter create period & contract", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create_period_contract)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.lean = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "create",
                granter: "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                payer: "",
                result: true,
                timestamp: "2022-10-27T03:17:44Z",
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
            }]);
        });
    })
});


