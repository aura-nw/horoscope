'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlAccountStatsService from '../../../../services/crawl-statistics/crawl-account-stats.service';
import TransactionStatsService from '../../../../services/crawl-statistics/transaction-stats.service';
import _ from 'lodash';
import { accountStat, accountStatReceive, accountStatRedundant, accountStatSend, listTx } from './mock-data';

Config.TEST = true;

describe('Test crawl-account-stats service', () => {
    jest.setTimeout(60000);

    const broker = new ServiceBroker({ logger: false });
    const crawlAccountStatsService = broker.createService(CrawlAccountStatsService);

    const transactionStatsService = broker.createService(TransactionStatsService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountStatsService.getQueue('crawl.account-stats').empty();
        await transactionStatsService.adapter.insertMany(listTx);
        await crawlAccountStatsService.adapter.insertMany([accountStat, accountStatRedundant]);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountStatsService.adapter.removeMany({});
        await transactionStatsService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new record', async () => {
        await crawlAccountStatsService.handleJob(null, []);
        await new Promise(r => setTimeout(r, 5000));

        const result = await crawlAccountStatsService.adapter.find({});

        expect(result.length).toEqual(6);
        expect(result.find((res: any) =>
            res.address === 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa').one_day)
            .toEqual(accountStatSend.one_day);
        expect(result.find((res: any) =>
            res.address === 'aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2').one_day)
            .toEqual(accountStatReceive.one_day);
    });
});