'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import AccountInfoService from '../../../../services/api-service/account-info.service';
import { Types } from 'mongoose';
import _ from 'lodash';
import { VESTING_ACCOUNT_TYPE } from '../../../../common/constant';

Config.TEST = true;

describe('Test account-info api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const accountInfoApiService = broker.createService(AccountInfoService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await accountInfoApiService.adapter.insert({
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
            "account_redelegations": [],
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
            "account_unbonding": [],
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
                    "@type": "/cosmos.auth.v1beta1.BaseAccount",
                    "address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "pub_key": {
                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "account_number": "10",
                    "sequence": "160"
                }
            }
        });
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await accountInfoApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return account info', async () => {
        const result = await accountInfoApiService.getAccountInfoByAddress({
            params: {
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
                chainId: Config.CHAIN_ID
            }
        });

        expect(result.data.account_auth).toEqual({
            "account": {
                "@type": "/cosmos.auth.v1beta1.BaseAccount",
                "address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                "pub_key": {
                    "@type": "/cosmos.crypto.secp256k1.PubKey",
                    "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                },
                "account_number": "10",
                "sequence": "160"
            }
        });
        expect(result.data.account_delegate_rewards).not.toBeUndefined();
    });

    it('Should return account delegation info', async () => {
        const result = await accountInfoApiService.getAccountInfoByAddress({
            params: {
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
                chainId: Config.CHAIN_ID
            }
        });

        expect(_.omit(result.data.account_delegations[0], ['_id'])).toEqual({
            "delegation": {
                "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                "shares": "71598000000.000000000000000000"
            },
            "balance": {
                "denom": "utaura",
                "amount": "71598000000"
            }
        });
        expect(result.data.account_delegate_rewards).not.toBeUndefined();
    })
});