'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import AccountUnbondsService from '../../../../services/api-service/account-unbonds.service';
import ValidatorService from '../../../../services/api-service/validator.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test account-unbonds api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const accountUnbondsApiService = broker.createService(AccountUnbondsService);

    const validatorApiService = broker.createService(ValidatorService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await accountUnbondsApiService.adapter.insert({
            _id: new Types.ObjectId(),
            "address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
            "account_balances": [
                {
                    "denom": "uaura",
                    "amount": "1000000",
                    "minimal_denom": "ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20"
                },
                {
                    "denom": "utaura",
                    "amount": "371128959828"
                }
            ],
            "account_delegations": [
                {
                    "delegation": {
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                        "shares": "71598000000.000000000000000000"
                    },
                    "balance": {
                        "denom": "utaura",
                        "amount": "71598000000"
                    }
                }
            ],
            "account_redelegations": [
                {
                    "redelegation": {
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_src_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                        "validator_dst_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                        "entries": null
                    },
                    "entries": [
                        {
                            "redelegation_entry": {
                                "creation_height": 3967815,
                                "completion_time": "2023-01-13T02:13:13.603644716Z",
                                "initial_balance": "1000000",
                                "shares_dst": "1000000.000000000000000000"
                            },
                            "balance": "1000000"
                        }
                    ]
                }
            ],
            "account_spendable_balances": [
                {
                    "denom": "uaura",
                    "amount": "1000000",
                    "minimal_denom": "ibc/40CA5EF447F368B7F2276A689383BE3C427B15395D4BF6639B605D36C0846A20"
                },
                {
                    "denom": "utaura",
                    "amount": "371128959828"
                }
            ],
            "account_unbonding": [
                {
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                    "entries": [
                        {
                            "creation_height": "3967835",
                            "completion_time": "2023-01-13T02:14:34.601118013Z",
                            "initial_balance": "1000000",
                            "balance": "1000000"
                        }
                    ]
                }
            ],
            "account_claimed_rewards": [
                {
                    "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                    "denom": "utaura",
                    "amount": "349483146627"
                },
                {
                    "validator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                    "denom": "",
                    "amount": ""
                }
            ],
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "account_auth": {
                "account": {
                    "@type": "/cosmos.vesting.v1beta1.ContinuousVestingAccount",
                    "base_vesting_account": {
                        "base_account": {
                            "address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                            "pub_key": {
                                "@type": "/cosmos.crypto.secp256k1.PubKey",
                                "key": "Aphhp0j+5mL0yNdPQDCoB19q52ZbRK+V2lmiOrnkiFKv"
                            },
                            "account_number": "1504093",
                            "sequence": "1"
                        },
                        "original_vesting": [
                            {
                                "denom": "uaura",
                                "amount": "20000000"
                            }
                        ],
                        "delegated_free": [],
                        "delegated_vesting": [],
                        "end_time": "1672398000"
                    },
                    "start_time": "1672389247"
                }
            }
        });
        await validatorApiService.adapter.insert({
            _id: new Types.ObjectId(),
            "commission": {
                "commission_rates": {
                    "rate": "1.000000000000000000",
                    "max_rate": "1.000000000000000000",
                    "max_change_rate": "1.000000000000000000"
                },
                "update_time": new Date(),
            },
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "operator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
            "consensus_pubkey": {
                "@type": "/cosmos.crypto.ed25519.PubKey",
                "key": "UaS9Gv6C+SB7PkbRFag2i8hOvJzFGks1+y5hnd0+C6w="
            },
            "jailed": false,
            "status": "BOND_STATUS_BONDED",
            "tokens": "21284885226",
            "delegator_shares": "21284885226.000000000000000000",
            "description": {
                "moniker": "Singapore",
                "identity": "",
                "website": "",
                "security_contact": "",
                "details": ""
            },
            "unbonding_height": "0",
            "unbonding_time": new Date(),
            "min_self_delegation": "1",
            "consensus_hex_address": "764253F53E43616A55A54BDAEE847A004D60FFF4",
            "uptime": 100,
            "account_address": "aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc",
            "percent_voting_power": 16.512855,
            "number_delegators": 0,
            "val_signing_info": {
                "address": "auravalcons1wep98af7gdsk54d9f0dwapr6qpxkpll5udf62e",
                "start_height": "976",
                "index_offset": "3966874",
                "jailed_until": new Date(),
                "tombstoned": false,
                "missed_blocks_counter": "0"
            },
            "self_delegation_balance": {
                "denom": "utaura",
                "amount": "102469134"
            }
        });
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await accountUnbondsApiService.adapter.removeMany({});
        await validatorApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return account\'s unbonding info', async () => {
        const result = await accountUnbondsApiService.getByAddress({
            params: {
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
                chainId: Config.CHAIN_ID
            }
        });

        expect(_.omit(result.data.account_unbonding[0], ['_id', 'entries'])).toEqual({
            "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
            "validator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
            "validator_description": {
                "description": {
                    "moniker": "Singapore",
                    "identity": "",
                    "website": "",
                    "security_contact": "",
                    "details": "",
                },
                "jailed": false
            }
        });
    });
});