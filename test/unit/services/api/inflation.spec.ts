'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import InflationService from '../../../../services/api-service/inflation.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test inflation api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const inflationApiService = broker.createService(InflationService);

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
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await inflationApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of inflation', async () => {
        const result: any = await broker.call('v1.inflation.getByChain', {});

        expect(_.omit(result.toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "inflation": "0.189558347320272517",
            "__v": 0
        });
    });
});