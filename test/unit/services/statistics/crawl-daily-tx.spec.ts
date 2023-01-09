'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlDailyTxService from '../../../../services/crawl-statistics/crawl-daily-tx.service';
import TransactionStatsService from '../../../../services/crawl-statistics/transaction-stats.service';
import AccountStatsService from '../../../../services/crawl-statistics/account-stats.service';
import _ from 'lodash';
import { dailyTxStatistic, listAccounts, listTx } from './mock-data';

Config.TEST = true;

describe('Test crawl-daily-tx service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const crawlDailyTxService = broker.createService(CrawlDailyTxService);

    const transactionStatsService = broker.createService(TransactionStatsService);
    const accountStatsService = broker.createService(AccountStatsService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlDailyTxService.getQueue('crawl.daily-tx').empty();
        await transactionStatsService.adapter.insertMany(listTx);
        await accountStatsService.adapter.insertMany(listAccounts);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlDailyTxService.adapter.removeMany({});
        await transactionStatsService.adapter.removeMany({});
        await accountStatsService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new record', async () => {
        await crawlDailyTxService.handleJob(null, 0, []);
        await new Promise(r => setTimeout(r, 5000));

        const result = await crawlDailyTxService.adapter.find({});

        expect(result.length).toEqual(1);
        expect(_.omit(result[0].toObject(), ['_id', '__v'])).toEqual(dailyTxStatistic);
    });
});