'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import SmartContractsService from '../../../../services/api-service/smart-contracts.service';
import CodeIDService from '../../../../services/code-id-manager/code-id-manager.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test smart-contracts api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const smartContractApiService = broker.createService(SmartContractsService);

    const codeIdService = broker.createService(CodeIDService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await smartContractApiService.adapter.insertMany([
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "contract_name": "Create minter",
                "contract_address": "aura12xhxkhyt7vwuk8rm28ptyz7wmnevphunw0katt40pkf7t6f72c2qg2f5es",
                "contract_hash": "79a51e6197086ea7a512808d096f7bac4731ab9a92b31d6d580f7c062466cc0f",
                "creator_address": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
                "tx_hash": "9D16FE93683C184F4BD33AFD0435CC79284D52CB85FD7E4014583C12F17E968C",
                "height": 3988984,
                "code_id": {
                    "id": 415,
                    "creator": "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
                },
                "num_tokens": 0,
                "msg": {
                    "create_minter": {
                        "minter_instantiate_msg": {
                            "base_token_uri": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                            "name": "NFT #2 13/01/2023",
                            "symbol": "YNFT",
                            "num_tokens": 10,
                            "max_tokens_per_batch_mint": 20,
                            "max_tokens_per_batch_transfer": 20,
                            "royalty_percentage": 5,
                            "royalty_payment_address": "aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e",
                            "image": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                            "animation_url": ""
                        }
                    }
                },
                "__v": 0,
                "contract_info": null,
                "marketing_info": null,
                "token_info": null
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "contract_name": "Check CW721",
                "contract_address": "aura199nt9335703a3cq5vdp2pyv7gx9k66r9vtdzr9w9hw7sgy09krcqfpwjjn",
                "contract_hash": "e0f6e57d2a8dea657066aed431f0f2c1763a44567fc634bc7803f9f2f2096c09",
                "creator_address": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
                "tx_hash": "9D16FE93683C184F4BD33AFD0435CC79284D52CB85FD7E4014583C12F17E968C",
                "height": 3988984,
                "code_id": {
                    "id": 418,
                    "creator": "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
                },
                "num_tokens": 0,
                "contract_info": {
                    "name": "NFT #2 13/01/2023",
                    "symbol": "YNFT"
                },
                "msg": {
                    "create_minter": {
                        "minter_instantiate_msg": {
                            "base_token_uri": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                            "name": "NFT #2 13/01/2023",
                            "symbol": "YNFT",
                            "num_tokens": 10,
                            "max_tokens_per_batch_mint": 20,
                            "max_tokens_per_batch_transfer": 20,
                            "royalty_percentage": 5,
                            "royalty_payment_address": "aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e",
                            "image": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                            "animation_url": ""
                        }
                    }
                },
                "__v": 0
            }
        ]);
        await codeIdService.adapter.insertMany([
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "contract_type": "CW721",
                "code_id": "415",
                "status": "TBD",
                "createdAt": new Date(),
                "updatedAt": new Date(),
                "__v": 0
            },
            {
                "_id": new Types.ObjectId(),
                "custom_info": {
                    "chain_id": Config.CHAIN_ID,
                    "chain_name": "Aura Devnet"
                },
                "contract_type": "CW721",
                "code_id": "418",
                "status": "COMPLETED",
                "createdAt": new Date(),
                "updatedAt": new Date(),
                "__v": 0
            }
        ]);
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await smartContractApiService.adapter.removeMany({});
        await codeIdService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of smart contract by contract address', async () => {
        const result: any = await broker.call('v1.smart-contracts.getContracts', {
            chainId: Config.CHAIN_ID,
            contract_addresses: ['aura12xhxkhyt7vwuk8rm28ptyz7wmnevphunw0katt40pkf7t6f72c2qg2f5es'],
            limit: 10,
        });

        expect(_.omit(result.data.smart_contracts[0], ['_id'])).toEqual({
            "code_id": {
                "id": 415,
                "creator": "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
            },
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "contract_name": "Create minter",
            "contract_address": "aura12xhxkhyt7vwuk8rm28ptyz7wmnevphunw0katt40pkf7t6f72c2qg2f5es",
            "contract_hash": "79a51e6197086ea7a512808d096f7bac4731ab9a92b31d6d580f7c062466cc0f",
            "creator_address": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
            "tx_hash": "9D16FE93683C184F4BD33AFD0435CC79284D52CB85FD7E4014583C12F17E968C",
            "height": 3988984,
            "num_tokens": 0,
            "msg": {
                "create_minter": {
                    "minter_instantiate_msg": {
                        "base_token_uri": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "name": "NFT #2 13/01/2023",
                        "symbol": "YNFT",
                        "num_tokens": 10,
                        "max_tokens_per_batch_mint": 20,
                        "max_tokens_per_batch_transfer": 20,
                        "royalty_percentage": 5,
                        "royalty_payment_address": "aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e",
                        "image": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "animation_url": ""
                    }
                }
            },
            "__v": 0,
            "contract_info": null,
            "marketing_info": null,
            "token_info": null,
            "contract_type": {
                "status": "TBD",
                "type": "CW721"
            }
        });
    });

    it('Should return result of smart contract by from height and to height', async () => {
        const result: any = await broker.call('v1.smart-contracts.getContracts', {
            chainId: Config.CHAIN_ID,
            fromHeight: 3988984,
            toHeight: 4000000,
            limit: 10,
        });

        expect(_.omit(result.data.smart_contracts[1], ['_id'])).toEqual({
            "code_id": {
                "id": 415,
                "creator": "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
            },
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "contract_name": "Create minter",
            "contract_address": "aura12xhxkhyt7vwuk8rm28ptyz7wmnevphunw0katt40pkf7t6f72c2qg2f5es",
            "contract_hash": "79a51e6197086ea7a512808d096f7bac4731ab9a92b31d6d580f7c062466cc0f",
            "creator_address": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
            "tx_hash": "9D16FE93683C184F4BD33AFD0435CC79284D52CB85FD7E4014583C12F17E968C",
            "height": 3988984,
            "num_tokens": 0,
            "msg": {
                "create_minter": {
                    "minter_instantiate_msg": {
                        "base_token_uri": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "name": "NFT #2 13/01/2023",
                        "symbol": "YNFT",
                        "num_tokens": 10,
                        "max_tokens_per_batch_mint": 20,
                        "max_tokens_per_batch_transfer": 20,
                        "royalty_percentage": 5,
                        "royalty_payment_address": "aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e",
                        "image": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "animation_url": ""
                    }
                }
            },
            "__v": 0,
            "contract_info": null,
            "marketing_info": null,
            "token_info": null,
            "contract_type": {
                "status": "TBD",
                "type": "CW721"
            }
        });
        expect(_.omit(result.data.smart_contracts[0], ['_id'])).toEqual({
            "code_id": {
                "id": 418,
                "creator": "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
            },
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "contract_name": "Check CW721",
            "contract_address": "aura199nt9335703a3cq5vdp2pyv7gx9k66r9vtdzr9w9hw7sgy09krcqfpwjjn",
            "contract_hash": "e0f6e57d2a8dea657066aed431f0f2c1763a44567fc634bc7803f9f2f2096c09",
            "creator_address": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
            "tx_hash": "9D16FE93683C184F4BD33AFD0435CC79284D52CB85FD7E4014583C12F17E968C",
            "height": 3988984,
            "num_tokens": 0,
            "contract_info": {
                "name": "NFT #2 13/01/2023",
                "symbol": "YNFT"
            },
            "msg": {
                "create_minter": {
                    "minter_instantiate_msg": {
                        "base_token_uri": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "name": "NFT #2 13/01/2023",
                        "symbol": "YNFT",
                        "num_tokens": 10,
                        "max_tokens_per_batch_mint": 20,
                        "max_tokens_per_batch_transfer": 20,
                        "royalty_percentage": 5,
                        "royalty_payment_address": "aura1trqfuz89vxe745lmn2yfedt7d4xnpcpvltc86e",
                        "image": "ipfs://QmPsZ9KFeQGcxtodgMki2aYYbnVsJiEJgSFHCToUGubTXi",
                        "animation_url": ""
                    }
                }
            },
            "__v": 0,
            "contract_type": {
                "status": "COMPLETED",
                "type": "CW721"
            }
        });
    });
});