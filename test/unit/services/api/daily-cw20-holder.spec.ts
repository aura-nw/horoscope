'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import DailyCw20HolderService from '../../../../services/api-service/daily-cw20-holder.service';
import CW20AssetManagerService from '../../../../services/asset-manager/cw20-asset-manager.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test daily-cw20-holder api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const dailyCw20HolderApiService = broker.createService(DailyCw20HolderService);

    const cw20AssetManagerService = broker.createService(CW20AssetManagerService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await dailyCw20HolderApiService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "code_id": 117,
            "contract_address": "aura15v8y2u3e4yvjrnn5zjj69dkx7x9xg5fg507k2q64k8waczxzg0cqkctc69",
            "old_holders": 13,
            "new_holders": 26,
            "change_percent": 100,
            "__v": 0
        });
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await dailyCw20HolderApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return contract\'s holder change percentage', async () => {
        const result = await dailyCw20HolderApiService.getCw20HolderChangePercent({
            params: {
                chainId: Config.CHAIN_ID,
                addresses: ["aura15v8y2u3e4yvjrnn5zjj69dkx7x9xg5fg507k2q64k8waczxzg0cqkctc69"]
            }
        });

        expect(result.data[0]).toEqual({
            contract_address: "aura15v8y2u3e4yvjrnn5zjj69dkx7x9xg5fg507k2q64k8waczxzg0cqkctc69",
            holders: 0,
            percentage: 100,
        });
    });
});