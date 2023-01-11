'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlDailyCw20HolderService from '../../../../services/crawl-statistics/crawl-daily-cw20-holder.service';
import Cw20HolderService from '../../../../services/crawl-statistics/cw20-holder.service';
import _ from 'lodash';
import { dailyCw20Holder, dailyCw20HolderOne, dailyCw20HolderTwo, listCw20Asset } from './mock-data';

Config.TEST = true;

describe('Test crawl-daily-cw20-holder service', () => {
    jest.setTimeout(60000);

    const broker = new ServiceBroker({ logger: false });
    const crawlDailyCw20HolderService = broker.createService(CrawlDailyCw20HolderService);

    const cw20HolderService = broker.createService(Cw20HolderService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlDailyCw20HolderService.getQueue('crawl.daily-cw20-holder').empty();
        await cw20HolderService.adapter.insertMany(listCw20Asset);
        await crawlDailyCw20HolderService.adapter.insert(dailyCw20Holder);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlDailyCw20HolderService.adapter.removeMany({});
        await cw20HolderService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update record', async () => {
        await crawlDailyCw20HolderService.handleJob();

        const result = await crawlDailyCw20HolderService.adapter.find({});

        expect(result.length).toEqual(1);
        expect(result.find((res: any) =>
            res.contract_address === 'aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567').old_holders)
            .toEqual(2);
        expect(result.find((res: any) =>
            res.contract_address === 'aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567').change_percent)
            .toEqual(100);
    });

    it('Should insert new record', async () => {
        await crawlDailyCw20HolderService.updateContractHolders(
            'aura1auz7cuwpg07w45zh22a8verwnwzz8p39sjaxeqan0v02aahjx63ss43kzw',
            87
        );
        await crawlDailyCw20HolderService.updateContractHolders(
            'aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm',
            117
        );

        const result = await crawlDailyCw20HolderService.adapter.find({});

        expect(_.omit(result.find((res: any) =>
            res.contract_address === 'aura1auz7cuwpg07w45zh22a8verwnwzz8p39sjaxeqan0v02aahjx63ss43kzw').toObject(), ['_id']))
            .toEqual(dailyCw20HolderOne);
        expect(_.omit(result.find((res: any) =>
            res.contract_address === 'aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm').toObject(), ['_id']))
            .toEqual(dailyCw20HolderTwo);
    })
});