'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import CrawlAccountClaimedRewardsService from '../../../../services/crawl-account-info/crawl-account-claimed-rewards.service';
import { txDelegate, txRedelegate, txUndelegate, txClaimReward, txSend } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-account-claimed-rewards service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);
    const crawlAccountClaimedRewardsService = broker.createService(CrawlAccountClaimedRewardsService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlAccountClaimedRewardsService.getQueue('crawl.account-claimed-rewards').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlAccountClaimedRewardsService.adapter.removeMany({});
        await broker.stop();
    });
    beforeEach(async () => await handleAddressService.handleJob([txSend], CONST_CHAR.CRAWL, Config.CHAIN_ID));
    afterEach(async () => await crawlAccountClaimedRewardsService.adapter.removeMany({}));

    it('Should update account_claimed_rewards case delegate', async () => {
        await crawlAccountClaimedRewardsService.handleJob([txDelegate]);

        let result = await crawlAccountClaimedRewardsService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_claimed_rewards.find((reward: any) => {
            return reward.validator_address === 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh'
        }).amount).toEqual('596298233');
    });

    it('Should update account_claimed_rewards case redelegate', async () => {
        await crawlAccountClaimedRewardsService.handleJob([txRedelegate]);

        let result = await crawlAccountClaimedRewardsService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_claimed_rewards.find((reward: any) => {
            return reward.validator_address === 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh'
        }).amount).toEqual('1789363');
    });

    it('Should update account_claimed_rewards case unbond', async () => {
        await crawlAccountClaimedRewardsService.handleJob([txUndelegate]);

        let result = await crawlAccountClaimedRewardsService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_claimed_rewards.find((reward: any) => {
            return reward.validator_address === 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh'
        }).amount).toEqual('5549636558');
    });

    it('Should update account_claimed_rewards case get rewards', async () => {
        await crawlAccountClaimedRewardsService.handleJob([txClaimReward]);

        let result = await crawlAccountClaimedRewardsService.adapter.findOne({
            address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
        });

        expect(result.account_claimed_rewards.find((reward: any) => {
            return reward.validator_address === 'auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh'
        }).amount).toEqual('150137738');
        expect(result.account_claimed_rewards.find((reward: any) => {
            return reward.validator_address === 'auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx'
        }).amount).toEqual('0');
    });
});