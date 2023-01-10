'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlCommunityPoolService from '../../../../services/crawl-distribution/crawl-community-pool.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-community-pool service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const communityPoolService = broker.createService(CrawlCommunityPoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await communityPoolService.getQueue('crawl.community-pool').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await communityPoolService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new community pool', async () => {
        await communityPoolService.handleJob();

        const result = await communityPoolService.adapter.findOne({});

        expect(result.pool.find((s: any) => s.denom === 'utaura')).not.toBeUndefined();
    });

    it('Should update community pool', async () => {
        const resultOld = await communityPoolService.adapter.findOne({});
        await new Promise(r => setTimeout(r, 5000));

        await communityPoolService.handleJob();

        const resultNew = await communityPoolService.adapter.findOne({});

        expect(parseInt(resultNew.pool.find((s: any) => s.denom === 'utaura').amount, 10)).not
            .toEqual(parseInt(resultOld.pool.find((s: any) => s.denom === 'utaura').amount, 10));
    });
});