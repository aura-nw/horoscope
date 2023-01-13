'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import ProposalService from '../../../../services/api-service/proposal.service';
import VoteService from '../../../../services/api-service/vote.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test proposal api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const proposalApiService = broker.createService(ProposalService);

    const voteApiService = broker.createService(VoteService);

    const date = new Date();

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await proposalApiService.adapter.insertMany([
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "proposal_id": 1,
                "content": {
                    "@type": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
                    "title": "Community Pool Spend test - send amount",
                    "description": "This is the summary of the key information about this proposal. This is a test proposal created by tester.",
                    "recipient": "aura1qqq4cecm6yvaep46729096urqq30k3kp2mctfw",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000"
                        }
                    ]
                },
                "status": "PROPOSAL_STATUS_REJECTED",
                "final_tally_result": {
                    "yes": "0",
                    "abstain": "403000000",
                    "no": "3000000",
                    "no_with_veto": "0"
                },
                "submit_time": date,
                "deposit_end_time": date,
                "total_deposit": [
                    {
                        "denom": "utaura",
                        "amount": "10000000"
                    }
                ],
                "voting_start_time": date,
                "voting_end_time": date,
                "deposit": [
                    {
                        "amount": []
                    }
                ],
                "proposer_address": "aura1srvkelaryqj34qfktc6sq0zvhf6tq60kjpc5re",
                "proposer_name": null,
                "initial_deposit": [],
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "proposal_id": 2,
                "content": {
                    "@type": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
                    "title": "Community Pool Spend test - send amount",
                    "description": "This is the summary of the key information about this proposal. This is a test proposal created by tester.",
                    "recipient": "aura1qqq4cecm6yvaep46729096urqq30k3kp2mctfw",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000"
                        }
                    ]
                },
                "status": "PROPOSAL_STATUS_PASSED",
                "final_tally_result": {
                    "yes": "402000000",
                    "abstain": "0",
                    "no": "0",
                    "no_with_veto": "0"
                },
                "submit_time": date,
                "deposit_end_time": date,
                "total_deposit": [
                    {
                        "denom": "utaura",
                        "amount": "10000000"
                    }
                ],
                "voting_start_time": date,
                "voting_end_time": date,
                "deposit": [
                    {
                        "amount": []
                    }
                ],
                "proposer_address": "aura1srvkelaryqj34qfktc6sq0zvhf6tq60kjpc5re",
                "proposer_name": null,
                "initial_deposit": [],
                "__v": 0
            }
        ]);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await proposalApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of proposal by id', async () => {
        const result: any = await broker.call('v1.proposal.getByChain', {
            chainid: Config.CHAIN_ID,
            proposalId: '1',
            pageLimit: 10,
            pageOffset: 0,
            reverse: true,
        });

        const proposal = Object.assign({}, result.data.proposals[0]);

        expect(_.omit(
            proposal,
            ['_id', 'total_deposit', 'content.amount', 'deposit', 'submit_time', 'deposit_end_time', 'voting_start_time', 'voting_end_time']
        )).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "proposal_id": 1,
            "content": {
                "@type": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
                "title": "Community Pool Spend test - send amount",
                "description": "This is the summary of the key information about this proposal. This is a test proposal created by tester.",
                "recipient": "aura1qqq4cecm6yvaep46729096urqq30k3kp2mctfw",
                "changes": [],
            },
            "status": "PROPOSAL_STATUS_REJECTED",
            "final_tally_result": {
                "yes": "0",
                "abstain": "403000000",
                "no": "3000000",
                "no_with_veto": "0"
            },
            "total_vote": [],
            "proposer_address": "aura1srvkelaryqj34qfktc6sq0zvhf6tq60kjpc5re",
            "proposer_name": null,
            "initial_deposit": [],
            "__v": 0
        });
    });

    it('Should return result of proposal by nextKey', async () => {
        const result: any = await broker.call('v1.proposal.getByChain', {
            chainid: Config.CHAIN_ID,
            pageLimit: 10,
            pageOffset: 0,
            nextKey: 1,
            reverse: false,
        });

        const proposal = Object.assign({}, result.data.proposals[0]);

        expect(_.omit(
            proposal,
            ['_id', 'total_deposit', 'content.amount', 'deposit', 'submit_time', 'deposit_end_time', 'voting_start_time', 'voting_end_time']
        )).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "proposal_id": 2,
            "content": {
                "@type": "/cosmos.distribution.v1beta1.CommunityPoolSpendProposal",
                "title": "Community Pool Spend test - send amount",
                "description": "This is the summary of the key information about this proposal. This is a test proposal created by tester.",
                "recipient": "aura1qqq4cecm6yvaep46729096urqq30k3kp2mctfw",
                "changes": []
            },
            "status": "PROPOSAL_STATUS_PASSED",
            "final_tally_result": {
                "yes": "402000000",
                "abstain": "0",
                "no": "0",
                "no_with_veto": "0"
            },
            "proposer_address": "aura1srvkelaryqj34qfktc6sq0zvhf6tq60kjpc5re",
            "proposer_name": null,
            "initial_deposit": [],
            "__v": 0
        });
    });
});