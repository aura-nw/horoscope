'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlProposalService from '../../../../services/crawl-proposal/crawl-deposit-proposal.service';
import _ from 'lodash';
import { callApiDepositProposal, proposal } from './mock-data';

Config.TEST = true;

describe('Test crawl-deposit-proposal service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const crawlDepositProposalService = broker.createService(CrawlProposalService);

    const mockCallApi = jest.fn(() => Promise.resolve(callApiDepositProposal));

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlDepositProposalService.getQueue('crawl.deposit.proposal').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlDepositProposalService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update proposal info', async () => {
        crawlDepositProposalService.callApiFromDomain = mockCallApi;
        await crawlDepositProposalService.adapter.insert(proposal);

        await crawlDepositProposalService.handleJobDeposit(proposal.proposal_id);

        const result = await crawlDepositProposalService.adapter.findOne({ proposal_id: proposal.proposal_id });

        expect(result.deposit[0].depositor).toEqual("aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa");
    });
});