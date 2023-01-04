'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import CrawlAccountAuthInfoService from '../../../../services/crawl-account-info/crawl-account-auth-info.service';
import DelayJobService from '../../../../services/crawl-account-info/delay-job.service';
import { accountDelayedVesting, accountDelayedVestingUpdated, accountPeriodicVesting, accountPeriodicVestingUpdated, callApiDelayedVesting, callApiPeriodicVesting, txSend } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-account-auth-info service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);
    const crawlAccountAuthService = broker.createService(CrawlAccountAuthInfoService);

    const delayJobService = broker.createService(DelayJobService);

    const mockCallApiDelayedVesting = jest.fn(() => Promise.resolve(callApiDelayedVesting));
    const mockCallApiPeriodicVesting = jest.fn(() => Promise.resolve(callApiPeriodicVesting));

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountAuthService.getQueue('crawl.account-auth-info').empty();
        await handleAddressService.handleJob([txSend], CONST_CHAR.CRAWL, Config.CHAIN_ID);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountAuthService.adapter.removeMany({});
        await delayJobService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update account_auth', async () => {
        await crawlAccountAuthService.handleJob(
            [
                'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
                'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
            ],
            Config.CHAIN_ID
        );
        await new Promise(r => setTimeout(r, 10000));

        let [resultOne, resultTwo] = await Promise.all([
            crawlAccountAuthService.adapter.findOne({
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
            }),
            crawlAccountAuthService.adapter.findOne({
                address: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
            })
        ]);
        console.log('Result account auth one', resultOne);
        console.log('Result account auth two', resultTwo);

        expect(resultOne.account_auth.account['@type']).toEqual('/cosmos.auth.v1beta1.BaseAccount');
        expect(resultTwo.account_auth.account['@type']).toEqual('/cosmos.auth.v1beta1.BaseAccount');
    });

    it('Should handle delayed vesting account', async () => {
        crawlAccountAuthService.callApiFromDomain = mockCallApiDelayedVesting;

        await crawlAccountAuthService.adapter.insert(accountDelayedVesting);
        await crawlAccountAuthService.handleJob(
            ['aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm'],
            Config.CHAIN_ID
        );

        let resultDelayedVesting = await crawlAccountAuthService.adapter.findOne({
            address: 'aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm'
        });

        expect(_.omit(resultDelayedVesting.toObject(), ['_id', '__v'])).toEqual(accountDelayedVestingUpdated);
    });

    it('Should handle periodic vesting account', async () => {
        crawlAccountAuthService.callApiFromDomain = mockCallApiPeriodicVesting;

        await crawlAccountAuthService.adapter.insert(accountPeriodicVesting);
        await crawlAccountAuthService.handleJob(
            ['aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g'],
            Config.CHAIN_ID
        );

        let resultPeriodicVesting = await crawlAccountAuthService.adapter.findOne({
            address: 'aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g'
        });

        expect(_.omit(resultPeriodicVesting.toObject(), ['_id', '__v'])).toEqual(accountPeriodicVestingUpdated);
    });
});