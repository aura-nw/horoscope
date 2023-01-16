'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CommunityPoolService from '../../../../services/api-service/community-pool.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test community-pool api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const communityPoolApiService = broker.createService(CommunityPoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
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
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await communityPoolApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of community-pool', async () => {
        const result: any = await broker.call('v1.communitypool.getByChain', {});

        expect(_.omit(result.pool[0].toObject(), ['_id'])).toEqual({
            "amount": "33883380918.667025638878102456",
            "denom": "utaura"
        });
    });
});