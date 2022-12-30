'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlSupplyService from '../../../../services/crawl-bank/crawl-supply.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-supply service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const supplyService = broker.createService(CrawlSupplyService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await supplyService.getQueue('crawl.supply').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await supplyService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new supply', async () => {
        await supplyService.handleJob();

        const result = await supplyService.adapter.findOne({});

        expect(result.supply.find((s: any) => s.denom === 'utaura')).not.toBeUndefined();
    });

    it('Should update supply', async () => {
        const resultOld = await supplyService.adapter.findOne({});
        await new Promise(r => setTimeout(r, 5000));

        await supplyService.handleJob();

        const resultNew = await supplyService.adapter.findOne({});

        expect(parseInt(resultNew.supply.find((s: any) => s.denom === 'utaura').amount, 10))
            .toBeGreaterThan(parseInt(resultOld.supply.find((s: any) => s.denom === 'utaura').amount, 10));
    });
});