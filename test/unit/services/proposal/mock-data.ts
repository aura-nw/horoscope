import { Config } from "../../../../common";
import { Types } from 'mongoose';

export const proposal = {
    _id: new Types.ObjectId(),
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "proposal_id": 386,
    "content": {
        "@type": "/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal",
        "title": "v0.4.0",
        "description": "vesting tx"
    },
    "status": "PROPOSAL_STATUS_REJECTED",
    "final_tally_result": {
        "yes": "21286119793",
        "abstain": "0",
        "no": "108000000",
        "no_with_veto": "0"
    },
    "submit_time": new Date(),
    "deposit_end_time": new Date(),
    "total_deposit": [
        {
            "denom": "utaura",
            "amount": "20000000"
        }
    ],
    "voting_start_time": new Date(),
    "voting_end_time": new Date(),
    "deposit": [
        {
            "amount": []
        }
    ],
    "proposer_address": "aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc",
    "proposer_name": "Singapore",
    "initial_deposit": [
        {
            "denom": "utaura",
            "amount": "20000000"
        }
    ],
    "turnout": "0",
    "tally": {
        "yes": "0",
        "abstain": "0",
        "no": "0",
        "no_with_veto": "0"
    }
};

export const callApiDepositProposal = {
    "deposits": [
        {
            "proposal_id": "386",
            "depositor": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
            "amount": [
                {
                    "denom": "utaura",
                    "amount": "19001009"
                }
            ]
        }
    ],
    "pagination": {
        "next_key": null,
        "total": "1"
    }
};

export const pool = {
    _id: new Types.ObjectId(),
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    not_bonded_tokens: "0",
    bonded_tokens: "128896873490"
};

export const proposalTally = {
    "tally": {
        "yes": "21286119793",
        "abstain": "0",
        "no": "108000000",
        "no_with_veto": "0"
    }
};