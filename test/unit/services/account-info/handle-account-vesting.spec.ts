'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import HandleAccountVestingService from '../../../../services/crawl-account-info/handle-account-vesting.service';
import { continuousVestingAccount, periodicVestingAccount } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test handle-account-vesting service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAccountVestingService = broker.createService(HandleAccountVestingService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await handleAccountVestingService.getQueue('handle.account-vesting').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await broker.stop();
    });
    afterEach(async () => {
        await handleAccountVestingService.adapter.removeMany({});
    });

    it('Should update account_info case continuous vesting', async () => {
        await handleAccountVestingService.adapter.insertMany(continuousVestingAccount);

        await handleAccountVestingService.handleVestingJob(null);

        let result = await handleAccountVestingService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_spendable_balances.length).toBeGreaterThan(0);
    });

    it('Should update account_info case periodic vesting', async () => {
        await handleAccountVestingService.adapter.insertMany(periodicVestingAccount);

        await handleAccountVestingService.handleVestingJob(null);

        let result = await handleAccountVestingService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_spendable_balances.length).toBeGreaterThan(0);
    });
});