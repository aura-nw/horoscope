'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import PoolService from '../../../../services/api-service/pool.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test pool api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const poolApiService = broker.createService(PoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
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
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await poolApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of pool', async () => {
        const result: any = await broker.call('v1.pool.getByChain', {});

        expect(_.omit(result.toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "not_bonded_tokens": "0",
            "bonded_tokens": "128896873490",
            "__v": 0
        });
    });
});