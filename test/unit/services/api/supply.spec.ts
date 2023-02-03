'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import SupplyService from '../../../../services/api-service/supply.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test supply api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const supplyApiService = broker.createService(SupplyService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await supplyApiService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "supply": [
                {
                    "denom": "ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20",
                    "amount": "99689060"
                },
                {
                    "denom": "ibc/6A3C5F13168F3193C0E2FD66C3D20C0D953C218A27C9E690525571224380399E",
                    "amount": "1000000"
                },
                {
                    "denom": "utaura",
                    "amount": "16697101745326"
                }
            ],
            "__v": 0
        });
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await supplyApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of supply', async () => {
        const result: any = await broker.call('v1.supply.getByChain', {});

        expect(_.omit(result.supply[0].toObject(), ['_id'])).toEqual({
            "denom": "ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20",
            "amount": "99689060"
        });
        expect(_.omit(result.supply[1].toObject(), ['_id'])).toEqual({
            "denom": "ibc/6A3C5F13168F3193C0E2FD66C3D20C0D953C218A27C9E690525571224380399E",
            "amount": "1000000"
        });
        expect(_.omit(result.supply[2].toObject(), ['_id'])).toEqual({
            "denom": "utaura",
            "amount": "16697101745326"
        });
    });
});