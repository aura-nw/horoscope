import { Config } from "../../../../common";
import { DELAY_JOB_TYPE, VESTING_ACCOUNT_TYPE } from "../../../../common/constant";
import { Types } from 'mongoose';

export const txSend = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.bank.v1beta1.MsgSend",
                    "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "to_address": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
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
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                        }
                    },
                    "sequence": "149"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "218"
                    }
                ],
                "gas_limit": "86929",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "gg+JCN9L+G0q/0sPA4rdZNeEPS/Hbuv6cXn8tR4IjLRg8bgVRFbAlGPGqc/R9tbSKjQic4LgyucmzU62lCbAKQ=="
        ]
    },
    "tx_response": {
        "height": "3505178",
        "txhash": "C1DCF0B039377DA7047A4F433DE51622E1766E6AF708906ECF7A9B0DC716FF9D",
        "codespace": "",
        "code": 0,
        "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "coin_received",
                        "attributes": [
                            {
                                "key": "receiver",
                                "value": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.bank.v1beta1.MsgSend"
                            },
                            {
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "module",
                                "value": "bank"
                            }
                        ]
                    },
                    {
                        "type": "transfer",
                        "attributes": [
                            {
                                "key": "recipient",
                                "value": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"
                            },
                            {
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "86929",
        "gas_used": "71058",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "to_address": "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
                        "amount": [
                            {
                                "denom": "utaura",
                                "amount": "1000000"
                            }
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
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                            }
                        },
                        "sequence": "149"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "218"
                        }
                    ],
                    "gas_limit": "86929",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "gg+JCN9L+G0q/0sPA4rdZNeEPS/Hbuv6cXn8tR4IjLRg8bgVRFbAlGPGqc/R9tbSKjQic4LgyucmzU62lCbAKQ=="
            ]
        },
        "timestamp": "2022-12-21T08:53:15Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjE4dXRhdXJh",
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
                        "value": "MjE4dXRhdXJh",
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
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjE4dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjE4dXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xNDk=",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "Z2crSkNOOUwrRzBxLzBzUEE0cmRaTmVFUFMvSGJ1djZjWG44dFI0SWpMUmc4YmdWUkZiQWxHUEdxYy9SOXRiU0tqUWljNExneXVjbXpVNjJsQ2JBS1E9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5iYW5rLnYxYmV0YTEuTXNnU2VuZA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "YmFuaw==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txDelegate = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.staking.v1beta1.MsgDelegate",
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                    "amount": {
                        "denom": "utaura",
                        "amount": "199000000"
                    }
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
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "147"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "479"
                    }
                ],
                "gas_limit": "191315",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "cSAMOLT2znlyIfL1bVm+EVQsZP7UCd2d9CWfgI+6XP5cyXvUeiE3ful6o9nhxxYTd2qCww9aG7IQpF5tjcP5yA=="
        ]
    },
    "tx_response": {
        "height": "3503293",
        "txhash": "649A85CCBBF365A10ECEB03146813A43DB216B708580EC514C8C726AB12B642C",
        "codespace": "",
        "code": 0,
        "data": "0A250A232F636F736D6F732E7374616B696E672E763162657461312E4D736744656C6567617465",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"596298233utaura\"},{\"key\":\"receiver\",\"value\":\"aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw\"},{\"key\":\"amount\",\"value\":\"199000000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"596298233utaura\"},{\"key\":\"spender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"199000000utaura\"}]},{\"type\":\"delegate\",\"attributes\":[{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"},{\"key\":\"amount\",\"value\":\"199000000utaura\"},{\"key\":\"new_shares\",\"value\":\"199000000.000000000000000000\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.staking.v1beta1.MsgDelegate\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"module\",\"value\":\"staking\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"596298233utaura\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"596298233utaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "coin_received",
                        "attributes": [
                            {
                                "key": "receiver",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "596298233utaura"
                            },
                            {
                                "key": "receiver",
                                "value": "aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw"
                            },
                            {
                                "key": "amount",
                                "value": "199000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "596298233utaura"
                            },
                            {
                                "key": "spender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "199000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "delegate",
                        "attributes": [
                            {
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            },
                            {
                                "key": "amount",
                                "value": "199000000utaura"
                            },
                            {
                                "key": "new_shares",
                                "value": "199000000.000000000000000000"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.staking.v1beta1.MsgDelegate"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "module",
                                "value": "staking"
                            },
                            {
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            }
                        ]
                    },
                    {
                        "type": "transfer",
                        "attributes": [
                            {
                                "key": "recipient",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "596298233utaura"
                            }
                        ]
                    },
                    {
                        "type": "withdraw_rewards",
                        "attributes": [
                            {
                                "key": "amount",
                                "value": "596298233utaura"
                            },
                            {
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "191315",
        "gas_used": "161657",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.staking.v1beta1.MsgDelegate",
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                        "amount": {
                            "denom": "utaura",
                            "amount": "199000000"
                        }
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
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "147"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "479"
                        }
                    ],
                    "gas_limit": "191315",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "cSAMOLT2znlyIfL1bVm+EVQsZP7UCd2d9CWfgI+6XP5cyXvUeiE3ful6o9nhxxYTd2qCww9aG7IQpF5tjcP5yA=="
            ]
        },
        "timestamp": "2022-12-21T06:45:49Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NDc5dXRhdXJh",
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
                        "value": "NDc5dXRhdXJh",
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
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NDc5dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NDc5dXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xNDc=",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "Y1NBTU9MVDJ6bmx5SWZMMWJWbStFVlFzWlA3VUNkMmQ5Q1dmZ0krNlhQNWN5WHZVZWlFM2Z1bDZvOW5oeHhZVGQycUN3dzlhRzdJUXBGNXRqY1A1eUE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5zdGFraW5nLnYxYmV0YTEuTXNnRGVsZWdhdGU=",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTk2Mjk4MjMzdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTk2Mjk4MjMzdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTk2Mjk4MjMzdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "withdraw_rewards",
                "attributes": [
                    {
                        "key": "YW1vdW50",
                        "value": "NTk2Mjk4MjMzdXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTk5MDAwMDAwdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTFmbDQ4dnNubXNkemN2ODVxNWQycTR6NWFqZGhhOHl1M3dkN2Rtdw==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTk5MDAwMDAwdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "delegate",
                "attributes": [
                    {
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTk5MDAwMDAwdXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "bmV3X3NoYXJlcw==",
                        "value": "MTk5MDAwMDAwLjAwMDAwMDAwMDAwMDAwMDAwMA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "c3Rha2luZw==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txRedelegate = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.staking.v1beta1.MsgBeginRedelegate",
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_src_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                    "validator_dst_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                    "amount": {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
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
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "148"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "715"
                    }
                ],
                "gas_limit": "285882",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "X/o8nQrDJv420ck56FhYRT5CbpQVrPwwjInt4ALvKk9gjJ4SSVnz3PwhAIL18irPrf1CSN2TMLgS3i3QeS9yeA=="
        ]
    },
    "tx_response": {
        "height": "3503300",
        "txhash": "E065298D38A2136D72069311B3D157F892F8B79F87DC87BE68184F6C3656F698",
        "codespace": "",
        "code": 0,
        "data": "0A3B0A2A2F636F736D6F732E7374616B696E672E763162657461312E4D7367426567696E526564656C6567617465120D0A0B08BAFA8F9D0610A990E65B",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1789363utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"1789363utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.staking.v1beta1.MsgBeginRedelegate\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"module\",\"value\":\"staking\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"}]},{\"type\":\"redelegate\",\"attributes\":[{\"key\":\"source_validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"},{\"key\":\"destination_validator\",\"value\":\"auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"},{\"key\":\"completion_time\",\"value\":\"2022-12-22T06:46:18Z\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"1789363utaura\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"1789363utaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "coin_received",
                        "attributes": [
                            {
                                "key": "receiver",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "1789363utaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "1789363utaura"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.staking.v1beta1.MsgBeginRedelegate"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "module",
                                "value": "staking"
                            },
                            {
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            }
                        ]
                    },
                    {
                        "type": "redelegate",
                        "attributes": [
                            {
                                "key": "source_validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            },
                            {
                                "key": "destination_validator",
                                "value": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            },
                            {
                                "key": "completion_time",
                                "value": "2022-12-22T06:46:18Z"
                            }
                        ]
                    },
                    {
                        "type": "transfer",
                        "attributes": [
                            {
                                "key": "recipient",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "1789363utaura"
                            }
                        ]
                    },
                    {
                        "type": "withdraw_rewards",
                        "attributes": [
                            {
                                "key": "amount",
                                "value": "1789363utaura"
                            },
                            {
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "285882",
        "gas_used": "234371",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.staking.v1beta1.MsgBeginRedelegate",
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_src_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                        "validator_dst_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                        "amount": {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
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
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "148"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "715"
                        }
                    ],
                    "gas_limit": "285882",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "X/o8nQrDJv420ck56FhYRT5CbpQVrPwwjInt4ALvKk9gjJ4SSVnz3PwhAIL18irPrf1CSN2TMLgS3i3QeS9yeA=="
            ]
        },
        "timestamp": "2022-12-21T06:46:18Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NzE1dXRhdXJh",
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
                        "value": "NzE1dXRhdXJh",
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
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NzE1dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NzE1dXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xNDg=",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "WC9vOG5RckRKdjQyMGNrNTZGaFlSVDVDYnBRVnJQd3dqSW50NEFMdktrOWdqSjRTU1ZuejNQd2hBSUwxOGlyUHJmMUNTTjJUTUxnUzNpM1FlUzl5ZUE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5zdGFraW5nLnYxYmV0YTEuTXNnQmVnaW5SZWRlbGVnYXRl",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTc4OTM2M3V0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTc4OTM2M3V0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTc4OTM2M3V0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "withdraw_rewards",
                "attributes": [
                    {
                        "key": "YW1vdW50",
                        "value": "MTc4OTM2M3V0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    }
                ]
            },
            {
                "type": "redelegate",
                "attributes": [
                    {
                        "key": "c291cmNlX3ZhbGlkYXRvcg==",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    },
                    {
                        "key": "ZGVzdGluYXRpb25fdmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZDNuMHY1ZjIzc3F6a2hsY25ld2hrc2FqOGwzeDdqZXl1OTM4Z3g=",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "Y29tcGxldGlvbl90aW1l",
                        "value": "MjAyMi0xMi0yMlQwNjo0NjoxOFo=",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "c3Rha2luZw==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txUndelegate = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.staking.v1beta1.MsgUndelegate",
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                    "amount": {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
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
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "146"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "562"
                    }
                ],
                "gas_limit": "224407",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "Bm/bu406qDa4eQqcVm08cJaXvpYw8+d7wReOjFRaKFhv71YmqtXSkz6Nm3XxGvBehAr34IVskO+lLfaOslHS0g=="
        ]
    },
    "tx_response": {
        "height": "3500954",
        "txhash": "634BFABF6C5EDB806ACC58B11306C3E2AC37D6F57DFB0DB93A45DF2BCC2E1AAC",
        "codespace": "",
        "code": 0,
        "data": "0A370A252F636F736D6F732E7374616B696E672E763162657461312E4D7367556E64656C6567617465120E0A0C088EB08F9D0610B1D2CDED01",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"5549636558utaura\"},{\"key\":\"receiver\",\"value\":\"aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"5549636558utaura\"},{\"key\":\"spender\",\"value\":\"aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.staking.v1beta1.MsgUndelegate\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"sender\",\"value\":\"aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw\"},{\"key\":\"module\",\"value\":\"staking\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"5549636558utaura\"},{\"key\":\"recipient\",\"value\":\"aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6\"},{\"key\":\"sender\",\"value\":\"aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"unbond\",\"attributes\":[{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"},{\"key\":\"completion_time\",\"value\":\"2022-12-22T04:07:42Z\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"5549636558utaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "coin_received",
                        "attributes": [
                            {
                                "key": "receiver",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "amount",
                                "value": "5549636558utaura"
                            },
                            {
                                "key": "receiver",
                                "value": "aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "5549636558utaura"
                            },
                            {
                                "key": "spender",
                                "value": "aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.staking.v1beta1.MsgUndelegate"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "sender",
                                "value": "aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw"
                            },
                            {
                                "key": "module",
                                "value": "staking"
                            },
                            {
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            }
                        ]
                    },
                    {
                        "type": "transfer",
                        "attributes": [
                            {
                                "key": "recipient",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "key": "amount",
                                "value": "5549636558utaura"
                            },
                            {
                                "key": "recipient",
                                "value": "aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6"
                            },
                            {
                                "key": "sender",
                                "value": "aura1fl48vsnmsdzcv85q5d2q4z5ajdha8yu3wd7dmw"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            }
                        ]
                    },
                    {
                        "type": "unbond",
                        "attributes": [
                            {
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            },
                            {
                                "key": "amount",
                                "value": "1000000utaura"
                            },
                            {
                                "key": "completion_time",
                                "value": "2022-12-22T04:07:42Z"
                            }
                        ]
                    },
                    {
                        "type": "withdraw_rewards",
                        "attributes": [
                            {
                                "key": "amount",
                                "value": "5549636558utaura"
                            },
                            {
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "224407",
        "gas_used": "187113",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.staking.v1beta1.MsgUndelegate",
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                        "amount": {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
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
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "146"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "562"
                        }
                    ],
                    "gas_limit": "224407",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "Bm/bu406qDa4eQqcVm08cJaXvpYw8+d7wReOjFRaKFhv71YmqtXSkz6Nm3XxGvBehAr34IVskO+lLfaOslHS0g=="
            ]
        },
        "timestamp": "2022-12-21T04:07:42Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTYydXRhdXJh",
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
                        "value": "NTYydXRhdXJh",
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
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTYydXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NTYydXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xNDY=",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "Qm0vYnU0MDZxRGE0ZVFxY1ZtMDhjSmFYdnBZdzgrZDd3UmVPakZSYUtGaHY3MVltcXRYU2t6Nk5tM1h4R3ZCZWhBcjM0SVZza08rbExmYU9zbEhTMGc9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5zdGFraW5nLnYxYmV0YTEuTXNnVW5kZWxlZ2F0ZQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTU0OTYzNjU1OHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTU0OTYzNjU1OHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTU0OTYzNjU1OHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "withdraw_rewards",
                "attributes": [
                    {
                        "key": "YW1vdW50",
                        "value": "NTU0OTYzNjU1OHV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFmbDQ4dnNubXNkemN2ODVxNWQycTR6NWFqZGhhOHl1M3dkN2Rtdw==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTF0eWdtczN4aGhzM3l2NDg3cGh4M2R3NGE5NWpuN3Q3bDZkenVkNg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTF0eWdtczN4aGhzM3l2NDg3cGh4M2R3NGE5NWpuN3Q3bDZkenVkNg==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFmbDQ4dnNubXNkemN2ODVxNWQycTR6NWFqZGhhOHl1M3dkN2Rtdw==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFmbDQ4dnNubXNkemN2ODVxNWQycTR6NWFqZGhhOHl1M3dkN2Rtdw==",
                        "index": true
                    }
                ]
            },
            {
                "type": "unbond",
                "attributes": [
                    {
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMDAwMHV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "Y29tcGxldGlvbl90aW1l",
                        "value": "MjAyMi0xMi0yMlQwNDowNzo0Mlo=",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "bW9kdWxl",
                        "value": "c3Rha2luZw==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const txClaimReward = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx"
                },
                {
                    "@type": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                    "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                    "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                }
            ],
            "extension_options": [],
            "non_critical_extension_options": [],
            "memo": "",
            "timeout_height": "0"
        },
        "auth_info": {
            "fee": {
                "amount": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593bf6"
                        },
                        "denom": "utaura",
                        "amount": "675"
                    }
                ],
                "gas_limit": "270000",
                "payer": "",
                "granter": ""
            },
            "signer_infos": [
                {
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "_id": {
                        "$oid": "637b3926f773300011593bf5"
                    },
                    "public_key": {
                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                        "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                    },
                    "sequence": "128"
                }
            ]
        },
        "signatures": [
            "R03usG16MPczqYmiCw+01AonbanC7buypxRbFitDKocrfYNsDg2qGtwa/SqcwJvQGv3a7JkmX51UOW8wkrtANg=="
        ]
    },
    "tx_response": {
        "height": 2875643,
        "txhash": "DD852313B5536BD62EE52790CD0E30D9D58D2B963C36CBE5AA97AF6BE2462474",
        "codespace": "",
        "code": 0,
        "data": "0A390A372F636F736D6F732E646973747269627574696F6E2E763162657461312E4D7367576974686472617744656C656761746F725265776172640A390A372F636F736D6F732E646973747269627574696F6E2E763162657461312E4D7367576974686472617744656C656761746F72526577617264",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward\"},{\"key\":\"module\",\"value\":\"distribution\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"0uaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx\"}]}]},{\"msg_index\":1,\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"150137738utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"150137738utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"module\",\"value\":\"distribution\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"sender\",\"value\":\"aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx\"},{\"key\":\"amount\",\"value\":\"150137738utaura\"}]},{\"type\":\"withdraw_rewards\",\"attributes\":[{\"key\":\"amount\",\"value\":\"150137738utaura\"},{\"key\":\"validator\",\"value\":\"auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh\"}]}]}]",
        "logs": [
            {
                "_id": {
                    "$oid": "637b3926f773300011593bf7"
                },
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593bf8"
                        },
                        "type": "message",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593bf9"
                                },
                                "key": "action",
                                "value": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593bfa"
                                },
                                "key": "module",
                                "value": "distribution"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593bfb"
                                },
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            }
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593bfc"
                        },
                        "type": "withdraw_rewards",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593bfd"
                                },
                                "key": "amount",
                                "value": "0uaura"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593bfe"
                                },
                                "key": "validator",
                                "value": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx"
                            }
                        ]
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593bff"
                },
                "msg_index": 1,
                "log": "",
                "events": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c00"
                        },
                        "type": "coin_received",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c01"
                                },
                                "key": "receiver",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c02"
                                },
                                "key": "amount",
                                "value": "150137738utaura"
                            }
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c03"
                        },
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c04"
                                },
                                "key": "spender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c05"
                                },
                                "key": "amount",
                                "value": "150137738utaura"
                            }
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c06"
                        },
                        "type": "message",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c07"
                                },
                                "key": "action",
                                "value": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c08"
                                },
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c09"
                                },
                                "key": "module",
                                "value": "distribution"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c0a"
                                },
                                "key": "sender",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            }
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c0b"
                        },
                        "type": "transfer",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c0c"
                                },
                                "key": "recipient",
                                "value": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c0d"
                                },
                                "key": "sender",
                                "value": "aura1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8ufn7tx"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c0e"
                                },
                                "key": "amount",
                                "value": "150137738utaura"
                            }
                        ]
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c0f"
                        },
                        "type": "withdraw_rewards",
                        "attributes": [
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c10"
                                },
                                "key": "amount",
                                "value": "150137738utaura"
                            },
                            {
                                "_id": {
                                    "$oid": "637b3926f773300011593c11"
                                },
                                "key": "validator",
                                "value": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "270000",
        "gas_used": "168461",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx"
                    },
                    {
                        "@type": "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
                        "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh"
                    }
                ],
                "memo": "",
                "timeout_height": "0",
                "extension_options": [],
                "non_critical_extension_options": []
            },
            "auth_info": {
                "signer_infos": [
                    {
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "128"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "675"
                        }
                    ],
                    "gas_limit": "270000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "R03usG16MPczqYmiCw+01AonbanC7buypxRbFitDKocrfYNsDg2qGtwa/SqcwJvQGv3a7JkmX51UOW8wkrtANg=="
            ]
        },
        "timestamp": {
            "$date": {
                "$numberLong": "1669019935000"
            }
        },
        "events": [
            {
                "_id": {
                    "$oid": "637b3926f773300011593c12"
                },
                "type": "coin_spent",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c13"
                        },
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c14"
                        },
                        "key": "YW1vdW50",
                        "value": "Njc1dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c15"
                },
                "type": "coin_received",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c16"
                        },
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c17"
                        },
                        "key": "YW1vdW50",
                        "value": "Njc1dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c18"
                },
                "type": "transfer",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c19"
                        },
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c1a"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c1b"
                        },
                        "key": "YW1vdW50",
                        "value": "Njc1dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c1c"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c1d"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c1e"
                },
                "type": "tx",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c1f"
                        },
                        "key": "ZmVl",
                        "value": "Njc1dXRhdXJh",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c20"
                        },
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c21"
                },
                "type": "tx",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c22"
                        },
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xMjg=",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c23"
                },
                "type": "tx",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c24"
                        },
                        "key": "c2lnbmF0dXJl",
                        "value": "UjAzdXNHMTZNUGN6cVltaUN3KzAxQW9uYmFuQzdidXlweFJiRml0REtvY3JmWU5zRGcycUd0d2EvU3Fjd0p2UUd2M2E3SmttWDUxVU9XOHdrcnRBTmc9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c25"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c26"
                        },
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5kaXN0cmlidXRpb24udjFiZXRhMS5Nc2dXaXRoZHJhd0RlbGVnYXRvclJld2FyZA==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c27"
                },
                "type": "withdraw_rewards",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c28"
                        },
                        "key": "YW1vdW50",
                        "value": "MHVhdXJh",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c29"
                        },
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZDNuMHY1ZjIzc3F6a2hsY25ld2hrc2FqOGwzeDdqZXl1OTM4Z3g=",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c2a"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c2b"
                        },
                        "key": "bW9kdWxl",
                        "value": "ZGlzdHJpYnV0aW9u",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c2c"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c2d"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c2e"
                        },
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5kaXN0cmlidXRpb24udjFiZXRhMS5Nc2dXaXRoZHJhd0RlbGVnYXRvclJld2FyZA==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c2f"
                },
                "type": "coin_spent",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c30"
                        },
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c31"
                        },
                        "key": "YW1vdW50",
                        "value": "MTUwMTM3NzM4dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c32"
                },
                "type": "coin_received",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c33"
                        },
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c34"
                        },
                        "key": "YW1vdW50",
                        "value": "MTUwMTM3NzM4dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c35"
                },
                "type": "transfer",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c36"
                        },
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c37"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c38"
                        },
                        "key": "YW1vdW50",
                        "value": "MTUwMTM3NzM4dXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c39"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c3a"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFqdjY1czNncnFmNnY2amwzZHA0dDZjOXQ5cms5OWNkOHVmbjd0eA==",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c3b"
                },
                "type": "withdraw_rewards",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c3c"
                        },
                        "key": "YW1vdW50",
                        "value": "MTUwMTM3NzM4dXRhdXJh",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c3d"
                        },
                        "key": "dmFsaWRhdG9y",
                        "value": "YXVyYXZhbG9wZXIxZWR3NGx3Y3ozZXNubGd6Y3c2MHJhOG0zOGszenlnejJ4dGwycWg=",
                        "index": true
                    }
                ]
            },
            {
                "_id": {
                    "$oid": "637b3926f773300011593c3e"
                },
                "type": "message",
                "attributes": [
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c3f"
                        },
                        "key": "bW9kdWxl",
                        "value": "ZGlzdHJpYnV0aW9u",
                        "index": true
                    },
                    {
                        "_id": {
                            "$oid": "637b3926f773300011593c40"
                        },
                        "key": "c2VuZGVy",
                        "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
};

export const listTx = [txSend, txDelegate, txRedelegate, txUndelegate, txClaimReward];

export const accountOne = {
    address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const accountTwo = {
    address: "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const continuousVestingAccount = {
    _id: new Types.ObjectId(),
    address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
    account_auth: {
        account: {
            '@type': VESTING_ACCOUNT_TYPE.CONTINUOUS,
            base_vesting_account: {
                end_time: (new Date().getTime()) + 1000000
            }
        }
    },
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const periodicVestingAccount = {
    _id: new Types.ObjectId(),
    address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
    account_auth: {
        account: {
            '@type': VESTING_ACCOUNT_TYPE.PERIODIC,
            vesting_periods: [
                [
                    { a: 1 },
                    { b: 1 },
                    { c: 1 },
                ]
            ],
            base_vesting_account: {
                end_time: (new Date().getTime()) + 1000000
            }
        }
    },
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const delayJobRedelegate = {
    _id: new Types.ObjectId(),
    content: {
        address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
    },
    type: DELAY_JOB_TYPE.REDELEGATE,
    expire_time: new Date(1666698955287),
    indexes: `aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa${DELAY_JOB_TYPE.REDELEGATE}1666698955287${Config.CHAIN_ID}`,
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
};

export const delayJobUnbond = {
    _id: new Types.ObjectId(),
    content: {
        address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
    },
    type: DELAY_JOB_TYPE.UNBOND,
    expire_time: new Date(1666698955287),
    indexes: `aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa${DELAY_JOB_TYPE.UNBOND}1666698955287${Config.CHAIN_ID}`,
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
};

export const delayJobDelayedVesting = {
    _id: new Types.ObjectId(),
    content: {
        address: "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
    },
    type: DELAY_JOB_TYPE.DELAYED_VESTING,
    expire_time: new Date(1666698955287),
    indexes: `aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa${DELAY_JOB_TYPE.DELAYED_VESTING}1666698955287${Config.CHAIN_ID}`,
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
};

export const callApiRedelegate = {
    "redelegation_responses": [
        {
            "redelegation": {
                "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                "validator_src_address": "auravaloper1d3n0v5f23sqzkhlcnewhksaj8l3x7jeyu938gx",
                "validator_dst_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
                "entries": null
            },
            "entries": [
                {
                    "redelegation_entry": {
                        "creation_height": 3610609,
                        "completion_time": "2022-12-27T07:41:38.761611491Z",
                        "initial_balance": "1000000",
                        "shares_dst": "1000000.000000000000000000"
                    },
                    "balance": "1000000"
                }
            ]
        }
    ],
    "pagination": {
        "next_key": null,
        "total": "1"
    }
};

export const callApiUnbond = {
    "unbonding_responses": [
        {
            "delegator_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
            "validator_address": "auravaloper1edw4lwcz3esnlgzcw60ra8m38k3zygz2xtl2qh",
            "entries": [
                {
                    "creation_height": "3610805",
                    "completion_time": "2022-12-27T07:54:53.432985851Z",
                    "initial_balance": "1000000",
                    "balance": "1000000"
                }
            ]
        }
    ],
    "pagination": {
        "next_key": null,
        "total": "1"
    }
};

export const callApiDelayedVesting = {
    "account": {
        "@type": "/cosmos.vesting.v1beta1.DelayedVestingAccount",
        "base_vesting_account": {
            "base_account": {
                "address": "aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm",
                "pub_key": null,
                "account_number": "1756",
                "sequence": "0"
            },
            "original_vesting": [
                {
                    "denom": "utaura",
                    "amount": "100000000"
                }
            ],
            "delegated_free": [],
            "delegated_vesting": [],
            "end_time": "1862447600"
        }
    }
};

export const callApiPeriodicVesting = {
    "account": {
        "@type": "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
        "base_vesting_account": {
            "base_account": {
                "address": "aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g",
                "pub_key": null,
                "account_number": "1757",
                "sequence": "0"
            },
            "original_vesting": [
                {
                    "denom": "utaura",
                    "amount": "10000000"
                }
            ],
            "delegated_free": [],
            "delegated_vesting": [],
            "end_time": "1668139800"
        },
        "start_time": "1668133800",
        "vesting_periods": [
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            },
            {
                "length": "600",
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000000"
                    }
                ]
            }
        ]
    }
};

export const accountDelayedVesting = {
    _id: new Types.ObjectId(),
    address: "aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm",
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const accountDelayedVestingUpdated = {
    address: "aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm",
    account_auth: {
        "account": {
            "@type": "/cosmos.vesting.v1beta1.DelayedVestingAccount",
            "base_vesting_account": {
                "base_account": {
                    "address": "aura1fndgsk37dss8judrcaae0gamdqdr8t3rlmvtpm",
                    "pub_key": null,
                    "account_number": "1756",
                    "sequence": "0"
                },
                "original_vesting": [
                    {
                        "denom": "utaura",
                        "amount": "100000000"
                    }
                ],
                "delegated_free": [],
                "delegated_vesting": [],
                "end_time": "1862447600"
            }
        }
    },
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const accountPeriodicVesting = {
    _id: new Types.ObjectId(),
    address: "aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g",
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};

export const accountPeriodicVestingUpdated = {
    address: "aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g",
    account_auth: {
        "account": {
            "@type": "/cosmos.vesting.v1beta1.PeriodicVestingAccount",
            "base_vesting_account": {
                "base_account": {
                    "address": "aura1zy5ttlyq34xdpyrzv6fusfnst483pp9n4fnc2g",
                    "pub_key": null,
                    "account_number": "1757",
                    "sequence": "0"
                },
                "original_vesting": [
                    {
                        "denom": "utaura",
                        "amount": "10000000"
                    }
                ],
                "delegated_free": [],
                "delegated_vesting": [],
                "end_time": "1668139800"
            },
            "start_time": "1668133800",
            "vesting_periods": [
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                },
                {
                    "length": "600",
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000000"
                        }
                    ]
                }
            ]
        }
    },
    account_balances: [],
    account_delegations: [],
    account_redelegations: [],
    account_spendable_balances: [],
    account_unbonding: [],
    account_claimed_rewards: [],
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    }
};
