'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import CrawlAccountRedelegatesService from '../../../../services/crawl-account-info/crawl-account-redelegates.service';
import DelayJobService from '../../../../services/crawl-account-info/delay-job.service';
import { callApiRedelegate, txRedelegate } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-account-redelegates service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);
    const crawlAccountRedelegatesService = broker.createService(CrawlAccountRedelegatesService);

    const delayJobService = broker.createService(DelayJobService);

    const mockCallApi = jest.fn(() => Promise.resolve(callApiRedelegate));

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountRedelegatesService.waitForServices(['v1.delay-job']);
        await crawlAccountRedelegatesService.getQueue('crawl.account-redelegates').empty();
        await handleAddressService.handleJob([txRedelegate], CONST_CHAR.CRAWL, Config.CHAIN_ID);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountRedelegatesService.adapter.removeMany({});
        await delayJobService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update account_redelegations', async () => {
        crawlAccountRedelegatesService.callApiFromDomain = mockCallApi;

        await crawlAccountRedelegatesService.handleJob(
            ['aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'],
            Config.CHAIN_ID
        );

        let [resultAccount, resultDelayJob] = await Promise.all([
            crawlAccountRedelegatesService.adapter.findOne({
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
            }),
            delayJobService.adapter.find({})
        ]);

        expect(resultAccount.account_redelegations.length).toEqual(1);
        expect(resultDelayJob.length).toEqual(1);
    });
});