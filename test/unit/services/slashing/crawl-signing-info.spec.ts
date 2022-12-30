'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlSigningInfoService from '../../../../services/crawl-slashing/crawl-signing-info.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-signing-info service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const signingInfoService = broker.createService(CrawlSigningInfoService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await signingInfoService.getQueue('crawl.signinginfo').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await signingInfoService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should ...', async () => {
        // TODO
    });
});