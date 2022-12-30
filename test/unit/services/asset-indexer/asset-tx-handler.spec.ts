'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlAccountInfoService from '../../../../services/asset-indexer/asset-tx-handler.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test asset-tx-handler service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const assetTxHandlerService = broker.createService(CrawlAccountInfoService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await assetTxHandlerService.getQueue('asset.tx-handle').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await assetTxHandlerService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should ...', async () => {
        // TODO
    });
});