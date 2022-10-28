'use strict';

process.env.TEST = 'true';

import { Context, Errors, ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { ITransaction } from '../../../../entities';
import FeegrantTxHandler from '../../../../services/feegrant-indexer/feegrant-tx-handler.service';
import * as Data from './mock-data.service'

describe('Test feegrant-tx-handler service', () => {
    const broker = new ServiceBroker({ logger: true });
    const service = broker.createService(FeegrantTxHandler);
    const listTx = Data.listTxFromPairGranterGrantee
    const mockFind = jest.fn(params =>
        Promise.resolve(listTx)
    );

    beforeAll(() => broker.start());
    afterAll(() => broker.stop());
    describe("Test filter", () => {
        it("Could filter create", async () => {
            const mockData: ITransaction[] = []
            //@ts-ignore
            mockData.push(Data.tx_create)
            const mockFind = jest.fn(params =>
                Promise.resolve(mockData)
            );
            // Replace adapter's insert with a mock
            service.adapter.find = mockFind;

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
            service.adapter.find = mockFind;

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
            service.adapter.find = mockFind;

            let result = await service.handleJob({ chainId: Config.CHAIN_ID })
            // Check the result
            expect(result).toEqual([{
                action: "revoke",
                granter: "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                grantee: "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
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
    })
});


