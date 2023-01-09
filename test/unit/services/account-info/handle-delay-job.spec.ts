'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import HandleDelayJobService from '../../../../services/crawl-account-info/handle-delay-job.service';
import DelayJobService from '../../../../services/crawl-account-info/delay-job.service';
import { delayJobDelayedVesting, delayJobRedelegate, delayJobUnbond, periodicVestingAccount } from './mock-data';
import _ from 'lodash';
import { DELAY_JOB_TYPE } from '../../../../common/constant';

Config.TEST = true;

describe('Test handle-delay-job service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleDelayJobService = broker.createService(HandleDelayJobService);

    const delayJobService = broker.createService(DelayJobService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await handleDelayJobService.getQueue('handle.delay-job').empty();
        await handleDelayJobService.adapter.insert(periodicVestingAccount);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await handleDelayJobService.adapter.removeMany({});
        await delayJobService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update account_info and delete delay job case redelegate', async () => {
        await delayJobService.adapter.insert(delayJobRedelegate);
        await handleDelayJobService.handleJob();

        let result = await delayJobService.adapter.find({
            query: {
                type: DELAY_JOB_TYPE.REDELEGATE
            }
        });

        expect(result.length).toEqual(0);
    });

    it('Should update account_info and delete delay job case unbond', async () => {
        await delayJobService.adapter.insert(delayJobUnbond);
        await handleDelayJobService.handleJob();

        let result = await delayJobService.adapter.find({
            query: {
                type: DELAY_JOB_TYPE.UNBOND
            }
        });

        expect(result.length).toEqual(0);
    });

    it('Should update account_info and delete delay job case delayed_vesting', async () => {
        await delayJobService.adapter.insert(delayJobDelayedVesting);
        await handleDelayJobService.handleJob();

        let result = await delayJobService.adapter.find({
            query: {
                type: DELAY_JOB_TYPE.DELAYED_VESTING
            }
        });

        expect(result.length).toEqual(0);
    });
});