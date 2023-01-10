'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import CrawlAccountBalancesService from '../../../../services/crawl-account-info/crawl-account-balances.service';
import IBCDenomService from '../../../../services/crawl-account-info/ibc-denom.service';
import { txSend } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-account-balances service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);
    const crawlAccountBalancesService = broker.createService(CrawlAccountBalancesService);
    const ibcDenomService = broker.createService(IBCDenomService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountBalancesService.getQueue('crawl.account-balances').empty();
        await handleAddressService.handleJob([txSend], CONST_CHAR.CRAWL, Config.CHAIN_ID);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountBalancesService.adapter.removeMany({});
        await ibcDenomService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update account_balances', async () => {
        await crawlAccountBalancesService.handleJob(
            [
                'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
                'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
            ],
            Config.CHAIN_ID
        );
        await crawlAccountBalancesService.handleJob(
            ['aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'],
            Config.CHAIN_ID
        );

        let [resultOne, resultTwo] = await Promise.all([
            crawlAccountBalancesService.adapter.findOne({
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
            }),
            crawlAccountBalancesService.adapter.findOne({
                address: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
            })
        ]);

        expect(resultOne.account_balances.length).toBeGreaterThan(0);
        expect(resultTwo.account_balances.length).toBeGreaterThan(0);
    });
});