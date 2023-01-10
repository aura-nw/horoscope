'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import CrawlAccountDelegatesService from '../../../../services/crawl-account-info/crawl-account-delegates.service';
import { txDelegate } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-account-delegates service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);
    const crawlAccountDelegatesService = broker.createService(CrawlAccountDelegatesService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountDelegatesService.getQueue('crawl.account-delegates').empty();
        await handleAddressService.handleJob([txDelegate], CONST_CHAR.CRAWL, Config.CHAIN_ID);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountDelegatesService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update account_delegations', async () => {
        await crawlAccountDelegatesService.handleJob(
            ['aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'],
            Config.CHAIN_ID
        );

        let result = await crawlAccountDelegatesService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_delegations.length).toBeGreaterThan(0);
    });
});