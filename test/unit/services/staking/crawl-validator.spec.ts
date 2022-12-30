'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlValidatorService from '../../../../services/crawl-staking/crawl-validator.service';
import CrawlPoolService from '../../../../services/crawl-staking/crawl-pool.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-validator service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const validatorService = broker.createService(CrawlValidatorService);

    const poolService = broker.createService(CrawlPoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await validatorService.getQueue('crawl.pool').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await validatorService.adapter.removeMany({});
        await poolService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new pool', async () => {
        await poolService.handleJob();
        await validatorService.handleJob();

        const result = await validatorService.adapter.find({});

        expect(result.find(
            (res: any) =>
                res.operator_address === 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx'
        ).account_address).toEqual('aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc');
        expect(result.find(
            (res: any) =>
                res.operator_address === 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh'
        ).account_address).toEqual('aura1edw4lwcz3esnlgzcw60ra8m38k3zygz2aewzcf');
    });
});