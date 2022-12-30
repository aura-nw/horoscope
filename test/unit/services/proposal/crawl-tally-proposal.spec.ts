'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlProposalService from '../../../../services/crawl-proposal/crawl-tally-proposal.service';
import CrawlPoolService from '../../../../services/crawl-staking/crawl-pool.service';
import _ from 'lodash';
import { pool, proposal, proposalTally } from './mock-data';

Config.TEST = true;

describe('Test crawl-tally-proposal service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const crawlTallyProposalService = broker.createService(CrawlProposalService);

    const crawlPoolService = broker.createService(CrawlPoolService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await crawlTallyProposalService.getQueue('crawl.tally.proposal').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await crawlTallyProposalService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should update proposal info', async () => {
        await crawlTallyProposalService.adapter.insert(proposal);
        await crawlPoolService.adapter.insert(pool);

        await crawlTallyProposalService.handleJob(proposal.proposal_id);

        const result = await crawlTallyProposalService.adapter.findOne({ proposal_id: proposal.proposal_id });

        expect(result.tally).toEqual(proposalTally.tally);
        expect(result.turnout).toEqual('16.597857');
    });
});