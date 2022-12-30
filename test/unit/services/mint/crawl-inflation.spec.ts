'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlInflationService from '../../../../services/crawl-mint/crawl-inflation.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-inflation service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const inflationService = broker.createService(CrawlInflationService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await inflationService.getQueue('crawl.inflation').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await inflationService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new inflation', async () => {
        await inflationService.handleJob();

        const result = await inflationService.adapter.findOne({});

        expect(result.inflation).not.toBeUndefined();
    });

    it('Should update inflation', async () => {
        const resultOld = await inflationService.adapter.findOne({});
        await new Promise(r => setTimeout(r, 5000));

        await inflationService.handleJob();

        const resultNew = await inflationService.adapter.findOne({});

        expect(parseInt(resultNew.inflation)).toEqual(parseInt(resultOld.inflation));
    });
});