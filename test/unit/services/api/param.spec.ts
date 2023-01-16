'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import ParamService from '../../../../services/api-service/param.service';
import { Types } from 'mongoose';
import _ from 'lodash';
import { MODULE_PARAM } from '../../../../common/constant';
import { ErrorMessage } from '../../../../types';

Config.TEST = true;

describe('Test param api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const paramApiService = broker.createService(ParamService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await paramApiService.adapter.insertMany([
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "bank",
                "params": {
                    "send_enabled": [],
                    "default_send_enabled": true
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "distribution",
                "params": {
                    "community_tax": "0.020000000000000000",
                    "base_proposer_reward": "0.010000000000000000",
                    "bonus_proposer_reward": "0.040000000000000000",
                    "withdraw_addr_enabled": true
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "gov",
                "params": {
                    "voting_param": {
                        "voting_period": "3600s"
                    },
                    "tallying_param": {
                        "quorum": "0.334000000000000000",
                        "threshold": "0.500000000000000000",
                        "veto_threshold": "0.334000000000000000"
                    },
                    "deposit_param": {
                        "min_deposit": [
                            {
                                "denom": "utaura",
                                "amount": "10000000"
                            }
                        ],
                        "max_deposit_period": "600s"
                    }
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "slashing",
                "params": {
                    "signed_blocks_window": "100",
                    "min_signed_per_window": "0.500000000000000000",
                    "downtime_jail_duration": "600s",
                    "slash_fraction_double_sign": "0.050000000000000000",
                    "slash_fraction_downtime": "0.010000000000000000"
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "staking",
                "params": {
                    "unbonding_time": "86400s",
                    "max_validators": 100,
                    "max_entries": 7,
                    "historical_entries": 10000,
                    "bond_denom": "utaura"
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "ibc-transfer",
                "params": {
                    "send_enabled": true,
                    "receive_enabled": true
                },
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "module": "mint",
                "params": {
                    "mint_denom": "utaura",
                    "inflation_rate_change": "0.130000000000000000",
                    "inflation_max": "0.200000000000000000",
                    "inflation_min": "0.070000000000000000",
                    "goal_bonded": "0.670000000000000000",
                    "blocks_per_year": "6311520"
                },
                "__v": 0
            }
        ]);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await paramApiService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of module bank', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.BANK,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "bank",
            "params": {
                "send_enabled": [],
                "default_send_enabled": true
            },
            "__v": 0
        });
    });

    it('Should return result of module distribution', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.DISTRIBUTION,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "distribution",
            "params": {
                "community_tax": "0.020000000000000000",
                "base_proposer_reward": "0.010000000000000000",
                "bonus_proposer_reward": "0.040000000000000000",
                "withdraw_addr_enabled": true
            },
            "__v": 0
        });
    });

    it('Should return result of module gov', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.GOVERNANCE,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "gov",
            "params": {
                "voting_param": {
                    "voting_period": "3600s"
                },
                "tallying_param": {
                    "quorum": "0.334000000000000000",
                    "threshold": "0.500000000000000000",
                    "veto_threshold": "0.334000000000000000"
                },
                "deposit_param": {
                    "min_deposit": [
                        {
                            "denom": "utaura",
                            "amount": "10000000"
                        }
                    ],
                    "max_deposit_period": "600s"
                }
            },
            "__v": 0
        });
    });
    it('Should return result of module slashing', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.SLASHING,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "slashing",
            "params": {
                "signed_blocks_window": "100",
                "min_signed_per_window": "0.500000000000000000",
                "downtime_jail_duration": "600s",
                "slash_fraction_double_sign": "0.050000000000000000",
                "slash_fraction_downtime": "0.010000000000000000"
            },
            "__v": 0
        });
    });
    it('Should return result of module staking', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.STAKING,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "staking",
            "params": {
                "unbonding_time": "86400s",
                "max_validators": 100,
                "max_entries": 7,
                "historical_entries": 10000,
                "bond_denom": "utaura"
            },
            "__v": 0
        });
    });
    it('Should return result of module ibc-transfer', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.IBC_TRANSFER,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "ibc-transfer",
            "params": {
                "send_enabled": true,
                "receive_enabled": true
            },
            "__v": 0
        });
    });
    it('Should return result of module mint', async () => {
        const result: any = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.MINT,
                pageLimit: 10,
                pageOffset: 0,
            }
        });

        expect(_.omit(result.data.result[0].toObject(), ['_id'])).toEqual({
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "module": "mint",
            "params": {
                "mint_denom": "utaura",
                "inflation_rate_change": "0.130000000000000000",
                "inflation_max": "0.200000000000000000",
                "inflation_min": "0.070000000000000000",
                "goal_bonded": "0.670000000000000000",
                "blocks_per_year": "6311520"
            },
            "__v": 0
        });
    });

    it('Should throw error invalid nextKey', async () => {
        const result = await paramApiService.getByChain({
            params: {
                chainid: Config.CHAIN_ID,
                module: MODULE_PARAM.MINT,
                pageLimit: 10,
                pageOffset: 0,
                nextKey: 'asvrevse'
            }
        });

        expect(result.message).toEqual(ErrorMessage.VALIDATION_ERROR);
    });
});