'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlPoolService from '../../../../services/crawl-staking/crawl-pool.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-pool service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const poolService = broker.createService(CrawlPoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await poolService.getQueue('crawl.pool').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await poolService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new pool', async () => {
        await poolService.handleJob();

        const result = await poolService.adapter.findOne({});

        expect(parseInt(result.bonded_tokens)).toBeGreaterThan(0);
    });

    it('Should update pool', async () => {
        const resultOld = await poolService.adapter.findOne({});
        await new Promise(r => setTimeout(r, 5000));

        await poolService.handleJob();

        const resultNew = await poolService.adapter.findOne({});

        expect(parseInt(resultNew.bonded_tokens)).toEqual(parseInt(resultOld.bonded_tokens));
    });
});