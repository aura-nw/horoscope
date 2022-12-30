'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlBlockService from '../../../../services/crawl-block/crawl-block.service';
import _ from 'lodash';
import { Utils } from '../../../../utils/utils';
import { URL_TYPE_CONSTANTS } from '../../../../common/constant';

Config.TEST = true;

describe('Test crawl-block service', () => {
    jest.setTimeout(60000);

    const broker = new ServiceBroker({ logger: false });
    const crawlBlockService = broker.createService(CrawlBlockService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlBlockService.getQueue('crawl.block').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        Config.START_BLOCK = 0;
        await crawlBlockService.redisClient.del(Config.REDIS_KEY_CURRENT_BLOCK);
        await crawlBlockService.redisClient.del(Config.REDIS_KEY_LATEST_BLOCK);
        await broker.stop();
    });

    // NEED TO REWRITE

    // it('Should init env', async () => {
    //     await crawlBlockService.initEnv();

    //     expect(crawlBlockService._currentBlock).toEqual(0);

    //     Config.START_BLOCK = 'a';
    //     await crawlBlockService.initEnv();

    //     expect(crawlBlockService._currentBlock).toEqual(0);

    //     await crawlBlockService.redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, 123);
    //     await crawlBlockService.initEnv();

    //     expect(crawlBlockService._currentBlock).toEqual(123);
    // });

    // it('Should crawl new block', async () => {
    //     const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);
    //     const responseGetLatestBlock = await crawlBlockService.callApiFromDomain(
    //         url,
    //         `${Config.GET_LATEST_BLOCK_API}`,
    //     );
    //     await crawlBlockService.redisClient.set(
    //         Config.REDIS_KEY_LATEST_BLOCK,
    //         responseGetLatestBlock.result.block.header.height - 1
    //     );
    //     crawlBlockService._currentBlock = parseInt(responseGetLatestBlock.result.block.header.height, 10) - 2;

    //     await crawlBlockService.handleJobCrawlBlock();

    //     expect(crawlBlockService._currentBlock).toEqual(parseInt(responseGetLatestBlock.result.block.header.height, 10));
    // });
});