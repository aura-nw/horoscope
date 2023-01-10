import { Config } from "../../../../common";
import { Types } from 'mongoose';

export const txInstantiateContract = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract",
                    "sender": "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
                    "admin": "",
                    "code_id": "330",
                    "label": "330 Contract CW20 Aura Token",
                    "msg": {
                        "name": "330 Aura Token",
                        "symbol": "AURADSK",
                        "decimals": 6,
                        "initial_balances": [
                        ],
                        "mint": {
                            "minter": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx"
                        },
                        "marketing": {
                            "marketing": "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
                            "description": "Coin gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
                            "logo": {
                                "url": "https://nft-ipfs.s3.amazonaws.com/QmWobdZpeyhq8NnUEoqLBzpz9HDTrQ1VoEK52aoh7bMLXE.gif"
                            }
                        }
                    },
                    "funds": [
                    ]
                }
            ],
            "memo": "",
            "timeout_height": "0",
            "extension_options": [
            ],
            "non_critical_extension_options": [
            ]
        },
        "auth_info": {
            "signer_infos": [
                {
                    "public_key": {
                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                        "key": "A4hse9YA503VmiSvUfGkEKpanwfYgOQPVhFMPn/lBCeH"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "1505"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "609"
                    }
                ],
                "gas_limit": "243475",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "+yw1Xhtld8FZpvnYzWdt4TrmwHJl8JtO8oYj7DJwcKBWy2ccxB/GZkRdUFUkuDAsbIejW81IXvEduB9dJNG+Rg=="
        ]
    },
    "tx_response": {
        "height": "3100159",
        "txhash": "CC6F136BBE5AB70E01133901CA8388CE5385A021C30906B569E64D7E0F5EE202",
        "codespace": "",
        "code": 0,
        "data": "0A6D0A282F636F736D7761736D2E7761736D2E76312E4D7367496E7374616E7469617465436F6E747261637412410A3F6175726131766A6B61383837647932757133376870657763786B7A756C79747137636A746863343634336B676D35656C7A676E676C30356A71727672336670",
        "raw_log": "[{\"events\":[{\"type\":\"instantiate\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp\"},{\"key\":\"code_id\",\"value\":\"330\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmwasm.wasm.v1.MsgInstantiateContract\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"sender\",\"value\":\"aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu\"}]},{\"type\":\"wasm\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp\"},{\"key\":\"instantiate\",\"value\":\"3\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "instantiate",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp"
                            },
                            {
                                "key": "code_id",
                                "value": "330"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmwasm.wasm.v1.MsgInstantiateContract"
                            },
                            {
                                "key": "module",
                                "value": "wasm"
                            },
                            {
                                "key": "sender",
                                "value": "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu"
                            }
                        ]
                    },
                    {
                        "type": "wasm",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp"
                            },
                            {
                                "key": "instantiate",
                                "value": "3"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "243475",
        "gas_used": "201652",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmwasm.wasm.v1.MsgInstantiateContract",
                        "sender": "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
                        "admin": "",
                        "code_id": "330",
                        "label": "330 Contract CW20 Aura Token",
                        "msg": {
                            "name": "330 Aura Token",
                            "symbol": "AURADSK",
                            "decimals": 6,
                            "initial_balances": [
                            ],
                            "mint": {
                                "minter": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx"
                            },
                            "marketing": {
                                "marketing": "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
                                "description": "Coin gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
                                "logo": {
                                    "url": "https://nft-ipfs.s3.amazonaws.com/QmWobdZpeyhq8NnUEoqLBzpz9HDTrQ1VoEK52aoh7bMLXE.gif"
                                }
                            }
                        },
                        "funds": [
                        ]
                    }
                ],
                "memo": "",
                "timeout_height": "0",
                "extension_options": [
                ],
                "non_critical_extension_options": [
                ]
            },
            "auth_info": {
                "signer_infos": [
                    {
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "A4hse9YA503VmiSvUfGkEKpanwfYgOQPVhFMPn/lBCeH"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "1505"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "609"
                        }
                    ],
                    "gas_limit": "243475",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "+yw1Xhtld8FZpvnYzWdt4TrmwHJl8JtO8oYj7DJwcKBWy2ccxB/GZkRdUFUkuDAsbIejW81IXvEduB9dJNG+Rg=="
            ]
        },
        "timestamp": "2022-12-02T08:29:45Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NjA5dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NjA5dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NjA5dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NjA5dXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdS8xNTA1",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "K3l3MVhodGxkOEZacHZuWXpXZHQ0VHJtd0hKbDhKdE84b1lqN0RKd2NLQld5MmNjeEIvR1prUmRVRlVrdURBc2JJZWpXODFJWHZFZHVCOWRKTkcrUmc9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc213YXNtLndhc20udjEuTXNnSW5zdGFudGlhdGVDb250cmFjdA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "d2FzbQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFoNnI3OHRya2syZXdycnk3czNsY2xycXU5YTIyY2EzaHBteXFmdQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "instantiate",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTF2amthODg3ZHkydXEzN2hwZXdjeGt6dWx5dHE3Y2p0aGM0NjQza2dtNWVsemduZ2wwNWpxcnZyM2Zw",
                        "index": true
                    },
                    {
                        "key": "Y29kZV9pZA==",
                        "value": "MzMw",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTF2amthODg3ZHkydXEzN2hwZXdjeGt6dWx5dHE3Y2p0aGM0NjQza2dtNWVsemduZ2wwNWpxcnZyM2Zw",
                        "index": true
                    },
                    {
                        "key": "aW5zdGFudGlhdGU=",
                        "value": "Mw==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txExecuteContractCreateMinter = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
                    "sender": "aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr",
                    "contract": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
                    "msg": { "create_minter": { "minter_instantiate_msg": { "base_token_uri": "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA", "name": "Test linking", "symbol": "YNFT", "num_tokens": 1, "max_tokens_per_batch_mint": 20, "max_tokens_per_batch_transfer": 20, "royalty_percentage": 1, "royalty_payment_address": "aura10dyct5559d7c767mkmjmzh022fq52ara95vdje", "image": "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA", "animation_url": "", "descriptions": "Aloha amigo" } } },
                    "funds": [
                    ]
                }
            ],
            "memo": "",
            "timeout_height": "0",
            "extension_options": [
            ],
            "non_critical_extension_options": [
            ]
        },
        "auth_info": {
            "signer_infos": [
                {
                    "public_key": {
                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                        "key": "A6kjUnGBqWqsQ02Al6PFLluChP2+BP6EWou/e80wCLJv"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "27"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1061"
                    }
                ],
                "gas_limit": "530238",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "I8Naf/2TqKefvaDlYpJo8NTgCHQUWvPt5O3yU79NC5RQKoxbwBUNgw6qxQQCkq5b6TIDOqkyWw66aVoIJQPO6Q=="
        ]
    },
    "tx_response": {
        "height": "3548440",
        "txhash": "FF6E8DD1F2ECC53D227756F4663427AD19B2F325A8669463EB84AC55F04694B8",
        "codespace": "",
        "code": 0,
        "data": "0A260A242F636F736D7761736D2E7761736D2E76312E4D736745786563757465436F6E7472616374",
        "raw_log": "[{\"events\":[{\"type\":\"execute\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58\"}]},{\"type\":\"instantiate\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl\"},{\"key\":\"code_id\",\"value\":\"415\"},{\"key\":\"_contract_address\",\"value\":\"aura1xl4vsq82heafg99mgatcaeg6eete2umdzvnfq56fh2zlkk7wud6qlstsr4\"},{\"key\":\"code_id\",\"value\":\"418\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmwasm.wasm.v1.MsgExecuteContract\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"sender\",\"value\":\"aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr\"}]},{\"type\":\"reply\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl\"},{\"key\":\"_contract_address\",\"value\":\"aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58\"}]},{\"type\":\"wasm\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58\"},{\"key\":\"method\",\"value\":\"instantiate\"},{\"key\":\"owner\",\"value\":\"aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr\"},{\"key\":\"contract_name\",\"value\":\"crates.io:factory\"},{\"key\":\"contract_version\",\"value\":\"0.1.0\"},{\"key\":\"_contract_address\",\"value\":\"aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl\"},{\"key\":\"contract_name\",\"value\":\"crates.io:artaverse-contracts\"},{\"key\":\"contract_version\",\"value\":\"0.1.0\"},{\"key\":\"method\",\"value\":\"instantiate\"},{\"key\":\"owner\",\"value\":\"aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58\"},{\"key\":\"_contract_address\",\"value\":\"aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl\"},{\"key\":\"action\",\"value\":\"instantiate_cw721_reply\"},{\"key\":\"_contract_address\",\"value\":\"aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58\"},{\"key\":\"action\",\"value\":\"instantiate_minter_reply\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "execute",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58"
                            }
                        ]
                    },
                    {
                        "type": "instantiate",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl"
                            },
                            {
                                "key": "code_id",
                                "value": "415"
                            },
                            {
                                "key": "_contract_address",
                                "value": "aura1xl4vsq82heafg99mgatcaeg6eete2umdzvnfq56fh2zlkk7wud6qlstsr4"
                            },
                            {
                                "key": "code_id",
                                "value": "418"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmwasm.wasm.v1.MsgExecuteContract"
                            },
                            {
                                "key": "module",
                                "value": "wasm"
                            },
                            {
                                "key": "sender",
                                "value": "aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr"
                            }
                        ]
                    },
                    {
                        "type": "reply",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl"
                            },
                            {
                                "key": "_contract_address",
                                "value": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58"
                            }
                        ]
                    },
                    {
                        "type": "wasm",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58"
                            },
                            {
                                "key": "method",
                                "value": "instantiate"
                            },
                            {
                                "key": "owner",
                                "value": "aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr"
                            },
                            {
                                "key": "contract_name",
                                "value": "crates.io:factory"
                            },
                            {
                                "key": "contract_version",
                                "value": "0.1.0"
                            },
                            {
                                "key": "_contract_address",
                                "value": "aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl"
                            },
                            {
                                "key": "contract_name",
                                "value": "crates.io:artaverse-contracts"
                            },
                            {
                                "key": "contract_version",
                                "value": "0.1.0"
                            },
                            {
                                "key": "method",
                                "value": "instantiate"
                            },
                            {
                                "key": "owner",
                                "value": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58"
                            },
                            {
                                "key": "_contract_address",
                                "value": "aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl"
                            },
                            {
                                "key": "action",
                                "value": "instantiate_cw721_reply"
                            },
                            {
                                "key": "_contract_address",
                                "value": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58"
                            },
                            {
                                "key": "action",
                                "value": "instantiate_minter_reply"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "530238",
        "gas_used": "422214",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
                        "sender": "aura175m8c55lzwdzdhepnju7a7x60sv3tcsmdcttlr",
                        "contract": "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
                        "msg": { "create_minter": { "minter_instantiate_msg": { "base_token_uri": "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA", "name": "Test linking", "symbol": "YNFT", "num_tokens": 1, "max_tokens_per_batch_mint": 20, "max_tokens_per_batch_transfer": 20, "royalty_percentage": 1, "royalty_payment_address": "aura10dyct5559d7c767mkmjmzh022fq52ara95vdje", "image": "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA", "animation_url": "", "descriptions": "Aloha amigo" } } },
                        "funds": [
                        ]
                    }
                ],
                "memo": "",
                "timeout_height": "0",
                "extension_options": [
                ],
                "non_critical_extension_options": [
                ]
            },
            "auth_info": {
                "signer_infos": [
                    {
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "A6kjUnGBqWqsQ02Al6PFLluChP2+BP6EWou/e80wCLJv"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "27"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1061"
                        }
                    ],
                    "gas_limit": "530238",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "I8Naf/2TqKefvaDlYpJo8NTgCHQUWvPt5O3yU79NC5RQKoxbwBUNgw6qxQQCkq5b6TIDOqkyWw66aVoIJQPO6Q=="
            ]
        },
        "timestamp": "2022-12-23T09:38:25Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTA2MXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTA2MXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTA2MXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MTA2MXV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRsci8yNw==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "SThOYWYvMlRxS2VmdmFEbFlwSm84TlRnQ0hRVVd2UHQ1TzN5VTc5TkM1UlFLb3hid0JVTmd3NnF4UVFDa3E1YjZUSURPcWt5V3c2NmFWb0lKUVBPNlE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc213YXNtLndhc20udjEuTXNnRXhlY3V0ZUNvbnRyYWN0",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "d2FzbQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "execute",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFrdzRxZW5hZTA3NzNyM3I3enBycThsZTY3ODZmM3AzZjl5emx2NXJ5ams4cGFxaHk1eXFzYXczdzU4",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFrdzRxZW5hZTA3NzNyM3I3enBycThsZTY3ODZmM3AzZjl5emx2NXJ5ams4cGFxaHk1eXFzYXczdzU4",
                        "index": true
                    },
                    {
                        "key": "bWV0aG9k",
                        "value": "aW5zdGFudGlhdGU=",
                        "index": true
                    },
                    {
                        "key": "b3duZXI=",
                        "value": "YXVyYTE3NW04YzU1bHp3ZHpkaGVwbmp1N2E3eDYwc3YzdGNzbWRjdHRscg==",
                        "index": true
                    },
                    {
                        "key": "Y29udHJhY3RfbmFtZQ==",
                        "value": "Y3JhdGVzLmlvOmZhY3Rvcnk=",
                        "index": true
                    },
                    {
                        "key": "Y29udHJhY3RfdmVyc2lvbg==",
                        "value": "MC4xLjA=",
                        "index": true
                    }
                ]
            },
            {
                "type": "instantiate",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFlZnJ1a3phbDhsZDRlMm1xdzBoaHlhanJ2MHV3NzRuYXN1ZTN6bjYweHpjajJwZGh3bWZxeHNuZHNs",
                        "index": true
                    },
                    {
                        "key": "Y29kZV9pZA==",
                        "value": "NDE1",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFlZnJ1a3phbDhsZDRlMm1xdzBoaHlhanJ2MHV3NzRuYXN1ZTN6bjYweHpjajJwZGh3bWZxeHNuZHNs",
                        "index": true
                    },
                    {
                        "key": "Y29udHJhY3RfbmFtZQ==",
                        "value": "Y3JhdGVzLmlvOmFydGF2ZXJzZS1jb250cmFjdHM=",
                        "index": true
                    },
                    {
                        "key": "Y29udHJhY3RfdmVyc2lvbg==",
                        "value": "MC4xLjA=",
                        "index": true
                    },
                    {
                        "key": "bWV0aG9k",
                        "value": "aW5zdGFudGlhdGU=",
                        "index": true
                    },
                    {
                        "key": "b3duZXI=",
                        "value": "YXVyYTFrdzRxZW5hZTA3NzNyM3I3enBycThsZTY3ODZmM3AzZjl5emx2NXJ5ams4cGFxaHk1eXFzYXczdzU4",
                        "index": true
                    }
                ]
            },
            {
                "type": "instantiate",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTF4bDR2c3E4MmhlYWZnOTltZ2F0Y2FlZzZlZXRlMnVtZHp2bmZxNTZmaDJ6bGtrN3d1ZDZxbHN0c3I0",
                        "index": true
                    },
                    {
                        "key": "Y29kZV9pZA==",
                        "value": "NDE4",
                        "index": true
                    }
                ]
            },
            {
                "type": "reply",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFlZnJ1a3phbDhsZDRlMm1xdzBoaHlhanJ2MHV3NzRuYXN1ZTN6bjYweHpjajJwZGh3bWZxeHNuZHNs",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFlZnJ1a3phbDhsZDRlMm1xdzBoaHlhanJ2MHV3NzRuYXN1ZTN6bjYweHpjajJwZGh3bWZxeHNuZHNs",
                        "index": true
                    },
                    {
                        "key": "YWN0aW9u",
                        "value": "aW5zdGFudGlhdGVfY3c3MjFfcmVwbHk=",
                        "index": true
                    }
                ]
            },
            {
                "type": "reply",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFrdzRxZW5hZTA3NzNyM3I3enBycThsZTY3ODZmM3AzZjl5emx2NXJ5ams4cGFxaHk1eXFzYXczdzU4",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTFrdzRxZW5hZTA3NzNyM3I3enBycThsZTY3ODZmM3AzZjl5emx2NXJ5ams4cGFxaHk1eXFzYXczdzU4",
                        "index": true
                    },
                    {
                        "key": "YWN0aW9u",
                        "value": "aW5zdGFudGlhdGVfbWludGVyX3JlcGx5",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txExecuteContractMint = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
                    "sender": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
                    "contract": "aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re",
                    "msg": { "mint": { "extension": { "animation_url": "https://searare.s3.ap-southeast-1.amazonaws.com/product/6315a178d0cab2724647d329/6ee0a2d8b9624495a5fabd1fda49defa.png" }, "owner": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5", "token_id": "token 34" } },
                    "funds": [
                    ]
                }
            ],
            "memo": "",
            "timeout_height": "0",
            "extension_options": [
            ],
            "non_critical_extension_options": [
            ]
        },
        "auth_info": {
            "signer_infos": [
                {
                    "public_key": {
                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                        "key": "AwGiaDuo6ICUpXpZy7Ii/P4QnZWrC2+fvBvF6f+3r4f8"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                        }
                    },
                    "sequence": "267"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "4419"
                    }
                ],
                "gas_limit": "176760",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "8/7E7jrMQeFbV11B9kZ1bYshfj27aXH2XTv8szEAjXtx9rrDsjauyn6hdjlLe2+1vsnzkAnBHSFQYk56t/tniw=="
        ]
    },
    "tx_response": {
        "height": "3484132",
        "txhash": "F28DA3024797EC6A458B76600879A814C367E97F8F9144088A37E3B6826B3B33",
        "codespace": "",
        "code": 0,
        "data": "0A260A242F636F736D7761736D2E7761736D2E76312E4D736745786563757465436F6E7472616374",
        "raw_log": "[{\"events\":[{\"type\":\"execute\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmwasm.wasm.v1.MsgExecuteContract\"},{\"key\":\"module\",\"value\":\"wasm\"},{\"key\":\"sender\",\"value\":\"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5\"}]},{\"type\":\"wasm\",\"attributes\":[{\"key\":\"_contract_address\",\"value\":\"aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re\"},{\"key\":\"action\",\"value\":\"mint\"},{\"key\":\"minter\",\"value\":\"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5\"},{\"key\":\"owner\",\"value\":\"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5\"},{\"key\":\"token_id\",\"value\":\"token 34\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "execute",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmwasm.wasm.v1.MsgExecuteContract"
                            },
                            {
                                "key": "module",
                                "value": "wasm"
                            },
                            {
                                "key": "sender",
                                "value": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
                            }
                        ]
                    },
                    {
                        "type": "wasm",
                        "attributes": [
                            {
                                "key": "_contract_address",
                                "value": "aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re"
                            },
                            {
                                "key": "action",
                                "value": "mint"
                            },
                            {
                                "key": "minter",
                                "value": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
                            },
                            {
                                "key": "owner",
                                "value": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
                            },
                            {
                                "key": "token_id",
                                "value": "token 34"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "176760",
        "gas_used": "150436",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmwasm.wasm.v1.MsgExecuteContract",
                        "sender": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
                        "contract": "aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re",
                        "msg": { "mint": { "extension": { "animation_url": "https://searare.s3.ap-southeast-1.amazonaws.com/product/6315a178d0cab2724647d329/6ee0a2d8b9624495a5fabd1fda49defa.png" }, "owner": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5", "token_id": "token 34" } },
                        "funds": [
                        ]
                    }
                ],
                "memo": "",
                "timeout_height": "0",
                "extension_options": [
                ],
                "non_critical_extension_options": [
                ]
            },
            "auth_info": {
                "signer_infos": [
                    {
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "AwGiaDuo6ICUpXpZy7Ii/P4QnZWrC2+fvBvF6f+3r4f8"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                            }
                        },
                        "sequence": "267"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "4419"
                        }
                    ],
                    "gas_limit": "176760",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "8/7E7jrMQeFbV11B9kZ1bYshfj27aXH2XTv8szEAjXtx9rrDsjauyn6hdjlLe2+1vsnzkAnBHSFQYk56t/tniw=="
            ]
        },
        "timestamp": "2022-12-20T09:10:24Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NDQxOXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NDQxOXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NDQxOXV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NDQxOXV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNS8yNjc=",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "OC83RTdqck1RZUZiVjExQjlrWjFiWXNoZmoyN2FYSDJYVHY4c3pFQWpYdHg5cnJEc2phdXluNmhkamxMZTIrMXZzbnprQW5CSFNGUVlrNTZ0L3RuaXc9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc213YXNtLndhc20udjEuTXNnRXhlY3V0ZUNvbnRyYWN0",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "d2FzbQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "execute",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTF0N3N2MjBrdzV2bThna3B6cmFrNHFmbXh4c2t0ZGM5eWtkamF5NWtyNWxyOGZydHNrd3dxZG5kNnJl",
                        "index": true
                    }
                ]
            },
            {
                "type": "wasm",
                "attributes": [
                    {
                        "key": "X2NvbnRyYWN0X2FkZHJlc3M=",
                        "value": "YXVyYTF0N3N2MjBrdzV2bThna3B6cmFrNHFmbXh4c2t0ZGM5eWtkamF5NWtyNWxyOGZydHNrd3dxZG5kNnJl",
                        "index": true
                    },
                    {
                        "key": "YWN0aW9u",
                        "value": "bWludA==",
                        "index": true
                    },
                    {
                        "key": "bWludGVy",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "b3duZXI=",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "dG9rZW5faWQ=",
                        "value": "dG9rZW4gMzQ=",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const instantiatedContract = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    contract_name: "330 Contract CW20 Aura Token",
    contract_address: "aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp",
    contract_hash: "bf6c76bc14e4e05010c9f1ef451cd91d4125bcd99663cba8c77e88c2bae2352e",
    creator_address: "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
    tx_hash: "CC6F136BBE5AB70E01133901CA8388CE5385A021C30906B569E64D7E0F5EE202",
    height: 3100159,
    code_id: {
        id: 330,
        creator: "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu"
    },
    marketing_info: {
        description: "Coin gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
        logo: {
            url: "https://nft-ipfs.s3.amazonaws.com/QmWobdZpeyhq8NnUEoqLBzpz9HDTrQ1VoEK52aoh7bMLXE.gif",
        },
        marketing: "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
        project: null,
    },
    msg: {
        decimals: 6,
        initial_balances: [],
        marketing: {
            description: "Coin gives you the joint benefits of open blockchain technology and traditional currency by converting your cash into a stable digital currency equivalent.",
            logo: {
                url: "https://nft-ipfs.s3.amazonaws.com/QmWobdZpeyhq8NnUEoqLBzpz9HDTrQ1VoEK52aoh7bMLXE.gif",
            },
            marketing: "aura1h6r78trkk2ewrry7s3lclrqu9a22ca3hpmyqfu",
        },
        mint: {
            minter: "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        },
        name: "330 Aura Token",
        symbol: "AURADSK",
    },
    num_tokens: 0,
    token_info: {
        decimals: 6,
        name: "330 Aura Token",
        symbol: "AURADSK",
        total_supply: "0",
    },
};

export const createMinterExecuteContractOne = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    contract_name: "Create minter",
    contract_address: "aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl",
    contract_hash: "79a51e6197086ea7a512808d096f7bac4731ab9a92b31d6d580f7c062466cc0f",
    creator_address: "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
    height: 3548440,
    msg: {
        create_minter: {
            minter_instantiate_msg: {
                animation_url: "",
                base_token_uri: "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA",
                descriptions: "Aloha amigo",
                image: "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA",
                max_tokens_per_batch_mint: 20,
                max_tokens_per_batch_transfer: 20,
                name: "Test linking",
                num_tokens: 1,
                royalty_payment_address: "aura10dyct5559d7c767mkmjmzh022fq52ara95vdje",
                royalty_percentage: 1,
                symbol: "YNFT",
            },
        },
    },
    num_tokens: 0,
    tx_hash: "FF6E8DD1F2ECC53D227756F4663427AD19B2F325A8669463EB84AC55F04694B8",
    code_id: {
        id: 415,
        creator: "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
    }
};

export const createMinterExecuteContractTwo = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    contract_name: "Check CW721",
    contract_address: "aura1xl4vsq82heafg99mgatcaeg6eete2umdzvnfq56fh2zlkk7wud6qlstsr4",
    contract_hash: "e0f6e57d2a8dea657066aed431f0f2c1763a44567fc634bc7803f9f2f2096c09",
    creator_address: "aura1kw4qenae0773r3r7zprq8le6786f3p3f9yzlv5ryjk8paqhy5yqsaw3w58",
    height: 3548440,
    msg: {
        create_minter: {
            minter_instantiate_msg: {
                animation_url: "",
                base_token_uri: "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA",
                descriptions: "Aloha amigo",
                image: "ipfs://QmPY5STkJ7274z7LSXcePKVPeGRvkv186gzFJdZv8VrqrA",
                max_tokens_per_batch_mint: 20,
                max_tokens_per_batch_transfer: 20,
                name: "Test linking",
                num_tokens: 1,
                royalty_payment_address: "aura10dyct5559d7c767mkmjmzh022fq52ara95vdje",
                royalty_percentage: 1,
                symbol: "YNFT",
            },
        },
    },
    num_tokens: 0,
    tx_hash: "FF6E8DD1F2ECC53D227756F4663427AD19B2F325A8669463EB84AC55F04694B8",
    code_id: {
        id: 418,
        creator: "aura1jm3x0e2s9fekwvvfpyn9h75lx0ffwjjhct8mqt"
    },
    contract_info: {
        name: "Test linking",
        symbol: "YNFT"
    }
};

export const mintContract = {
    _id: new Types.ObjectId(),
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura devnet"
    },
    contract_name: "t-nft",
    contract_address: "aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re",
    contract_hash: "97338ce6ecb1552e814d14fca3bded44a4fdf536422da44f8cda4c9d22090b42",
    creator_address: "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
    tx_hash: "70D06263E5F3DE871B78F1F612EED38A49B08175ADFAF63282612AA0814935B5",
    height: 2513076,
    code_id: {
        id: 259,
        creator: "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
    },
};
