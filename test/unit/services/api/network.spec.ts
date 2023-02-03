'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import NetworkService from '../../../../services/api-service/network.service';
import InflationService from '../../../../services/api-service/inflation.service';
import CommunityPoolService from '../../../../services/api-service/community-pool.service';
import PoolService from '../../../../services/api-service/pool.service';
import SupplyService from '../../../../services/api-service/supply.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test network api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const networkApiService = broker.createService(NetworkService);

    const inflationApiService = broker.createService(InflationService);
    const communityPoolApiService = broker.createService(CommunityPoolService);
    const poolApiService = broker.createService(PoolService);
    const supplyApiService = broker.createService(SupplyService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await inflationApiService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "inflation": "0.189558347320272517",
            "__v": 0
        });
        await communityPoolApiService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "pool": [
                {
                    "amount": "33883380918.667025638878102456",
                    "denom": "utaura"
                }
            ],
            "__v": 0
        });
        await poolApiService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "not_bonded_tokens": "0",
            "bonded_tokens": "128896873490",
            "__v": 0
        });
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
        await inflationApiService.adapter.removeMany({});
        await communityPoolApiService.adapter.removeMany({});
        await poolApiService.adapter.removeMany({});
        await supplyApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of network info', async () => {
        const result: any = await broker.call('v1.network.status', { chainid: Config.CHAIN_ID });

        expect(_.omit(result.data.inflation.toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "inflation": "0.189558347320272517",
            "__v": 0
        });
        expect(_.omit(result.data.communityPool.pool[0].toObject(), ['_id'])).toEqual({
            "amount": "33883380918.667025638878102456",
            "denom": "utaura"
        });
        expect(_.omit(result.data.pool.toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "not_bonded_tokens": "0",
            "bonded_tokens": "128896873490",
            "__v": 0
        });
        expect(_.omit(result.data.supply.supply[0].toObject(), ['_id'])).toEqual({
            "denom": "ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20",
            "amount": "99689060"
        });
        expect(_.omit(result.data.supply.supply[1].toObject(), ['_id'])).toEqual({
            "denom": "ibc/6A3C5F13168F3193C0E2FD66C3D20C0D953C218A27C9E690525571224380399E",
            "amount": "1000000"
        });
        expect(_.omit(result.data.supply.supply[2].toObject(), ['_id'])).toEqual({
            "denom": "utaura",
            "amount": "16697101745326"
        });
    });
});