import { Config } from "../../../../common";
import { Types } from 'mongoose';

const date = new Date();
date.setDate(date.getDate() - 1);
let prevDate = date.setUTCHours(0, 0, 0, 0);

export const listTx = [
    {
        _id: new Types.ObjectId(),
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "to_address": "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2",
                        "amount": [
                            {
                                "denom": "utaura",
                                "amount": "1000000"
                            }
                        ]
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
                            "denom": "utaura",
                            "amount": "217"
                        }
                    ],
                    "gas_limit": "86764",
                    "payer": "",
                    "granter": ""
                },
                "signer_infos": [
                    {
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                            }
                        },
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "sequence": "122"
                    }
                ]
            },
            "signatures": [
                "/v0mSN8TpYzOa52ur3Nj/hZ+or8glZRszaa2/nrWQ8YK2IxZ0/YNlS5nYtfvfTK46bfly2AKujxz1LBFjKxYUw=="
            ]
        },
        "custom_info": {
            "chain_id": Config.CHAIN_ID,
            "chain_name": "Aura Devnet"
        },
        "tx_response": {
            "height": 2874901,
            "txhash": "388BA7E30348B37A0EF632962A8F3A76AA37BE04A0C7203C7BA81A2115ECF89A",
            "codespace": "",
            "code": "0",
            "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
            "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]}]}]",
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
                                    "value": "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2"
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
                                    "value": "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2"
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
            "gas_wanted": "86764",
            "gas_used": "70931",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.bank.v1beta1.MsgSend",
                            "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                            "to_address": "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2",
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
                                    "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                                }
                            },
                            "sequence": "122"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "utaura",
                                "amount": "217"
                            }
                        ],
                        "gas_limit": "86764",
                        "payer": "",
                        "granter": ""
                    }
                },
                "signatures": [
                    "/v0mSN8TpYzOa52ur3Nj/hZ+or8glZRszaa2/nrWQ8YK2IxZ0/YNlS5nYtfvfTK46bfly2AKujxz1LBFjKxYUw=="
                ]
            },
            "timestamp": new Date(1669016925000),
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
                            "value": "MjE3dXRhdXJh",
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
                            "value": "MjE3dXRhdXJh",
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
                            "value": "MjE3dXRhdXJh",
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
                            "value": "MjE3dXRhdXJh",
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
                            "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xMjI=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "L3YwbVNOOFRwWXpPYTUydXIzTmovaForb3I4Z2xaUnN6YWEyL25yV1E4WUsySXhaMC9ZTmxTNW5ZdGZ2ZlRLNDZiZmx5MkFLdWp4ejFMQkZqS3hZVXc9PQ==",
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
                            "value": "YXVyYTFjOTByNTJwcDVsdmZla2s3ZHVsYzh2MDB2N3Vxdnk3ZzdxNWh5Mg==",
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
                            "value": "YXVyYTFjOTByNTJwcDVsdmZla2s3ZHVsYzh2MDB2N3Vxdnk3ZzdxNWh5Mg==",
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
        },
        "indexes": {
            "timestamp": new Date(prevDate),
            "height": 2874901,
            "coin_spent_spender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "coin_spent_amount": [
                "217utaura",
                "1000000utaura"
            ],
            "coin_received_receiver": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2"
            ],
            "coin_received_amount": [
                "217utaura",
                "1000000utaura"
            ],
            "transfer_recipient": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2"
            ],
            "transfer_sender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "transfer_amount": [
                "217utaura",
                "1000000utaura"
            ],
            "message_sender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "tx_fee": [
                "217utaura"
            ],
            "tx_fee_payer": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "tx_acc_seq": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa/122"
            ],
            "tx_signature": [
                "/v0mSN8TpYzOa52ur3Nj/hZ+or8glZRszaa2/nrWQ8YK2IxZ0/YNlS5nYtfvfTK46bfly2AKujxz1LBFjKxYUw=="
            ],
            "message_action": [
                "/cosmos.bank.v1beta1.MsgSend"
            ],
            "message_module": [
                "bank"
            ],
            "addresses": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2"
            ]
        },
    },
    {
        _id: new Types.ObjectId(),
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgMultiSend",
                        "inputs": [
                            {
                                "address": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
                                "coins": [
                                    {
                                        "denom": "utaura",
                                        "amount": "30000"
                                    }
                                ]
                            }
                        ],
                        "outputs": [
                            {
                                "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                "coins": [
                                    {
                                        "denom": "utaura",
                                        "amount": "10000"
                                    }
                                ]
                            },
                            {
                                "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                "coins": [
                                    {
                                        "denom": "utaura",
                                        "amount": "10000"
                                    }
                                ]
                            },
                            {
                                "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                "coins": [
                                    {
                                        "denom": "utaura",
                                        "amount": "10000"
                                    }
                                ]
                            }
                        ]
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
                            "denom": "utaura",
                            "amount": "22"
                        }
                    ],
                    "gas_limit": "106488",
                    "payer": "",
                    "granter": ""
                },
                "signer_infos": [
                    {
                        "public_key": {
                            "@type": "/cosmos.crypto.multisig.LegacyAminoPubKey"
                        },
                        "sequence": "103"
                    }
                ]
            },
            "signatures": [
                "CkB7LygtW9lnpplE7YQA7V6WCd1f+9ZVePI3M1iZP70xiH3YhdQL0k/Em5K9M6ButCGtky1zjmcQdmJkDkRk2W07"
            ]
        },
        "custom_info": {
            "chain_id": "aura-testnet-2",
            "chain_name": "Aura devnet"
        },
        "tx_response": {
            "height": 3458024,
            "txhash": "BB0889E65F66B6AB3F7919E3107FF9B093285E09736E58C370BD739C72385E6A",
            "codespace": "",
            "code": "0",
            "data": "0A230A212F636F736D6F732E62616E6B2E763162657461312E4D73674D756C746953656E64",
            "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"},{\"key\":\"receiver\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"},{\"key\":\"receiver\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1522aavcagyrahayuspe47ndje7s694dkzcup6x\"},{\"key\":\"amount\",\"value\":\"30000utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgMultiSend\"},{\"key\":\"sender\",\"value\":\"aura1522aavcagyrahayuspe47ndje7s694dkzcup6x\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"},{\"key\":\"recipient\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"},{\"key\":\"recipient\",\"value\":\"aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8\"},{\"key\":\"amount\",\"value\":\"10000utaura\"}]}]}]",
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
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                },
                                {
                                    "key": "receiver",
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                },
                                {
                                    "key": "receiver",
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                }
                            ]
                        },
                        {
                            "type": "coin_spent",
                            "attributes": [
                                {
                                    "key": "spender",
                                    "value": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
                                },
                                {
                                    "key": "amount",
                                    "value": "30000utaura"
                                }
                            ]
                        },
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/cosmos.bank.v1beta1.MsgMultiSend"
                                },
                                {
                                    "key": "sender",
                                    "value": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
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
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                },
                                {
                                    "key": "recipient",
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                },
                                {
                                    "key": "recipient",
                                    "value": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
                                },
                                {
                                    "key": "amount",
                                    "value": "10000utaura"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "106488",
            "gas_used": "86383",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.bank.v1beta1.MsgMultiSend",
                            "inputs": [
                                {
                                    "address": "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
                                    "coins": [
                                        {
                                            "denom": "utaura",
                                            "amount": "30000"
                                        }
                                    ]
                                }
                            ],
                            "outputs": [
                                {
                                    "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                    "coins": [
                                        {
                                            "denom": "utaura",
                                            "amount": "10000"
                                        }
                                    ]
                                },
                                {
                                    "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                    "coins": [
                                        {
                                            "denom": "utaura",
                                            "amount": "10000"
                                        }
                                    ]
                                },
                                {
                                    "address": "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8",
                                    "coins": [
                                        {
                                            "denom": "utaura",
                                            "amount": "10000"
                                        }
                                    ]
                                }
                            ]
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
                                "@type": "/cosmos.crypto.multisig.LegacyAminoPubKey",
                                "threshold": 1,
                                "public_keys": [
                                    {
                                        "@type": "/cosmos.crypto.secp256k1.PubKey",
                                        "key": "AnoOQm4UTbzswwES5Mo+/LHFbT9653fDecq4Rrc+2jnA"
                                    }
                                ]
                            },
                            "mode_info": {
                                "multi": {
                                    "bitarray": {
                                        "extra_bits_stored": 1,
                                        "elems": "gA=="
                                    },
                                    "mode_infos": [
                                        {
                                            "single": {
                                                "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                                            }
                                        }
                                    ]
                                }
                            },
                            "sequence": "103"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "utaura",
                                "amount": "22"
                            }
                        ],
                        "gas_limit": "106488",
                        "payer": "",
                        "granter": ""
                    }
                },
                "signatures": [
                    "CkB7LygtW9lnpplE7YQA7V6WCd1f+9ZVePI3M1iZP70xiH3YhdQL0k/Em5K9M6ButCGtky1zjmcQdmJkDkRk2W07"
                ]
            },
            "timestamp": new Date(1671421512000),
            "events": [
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjJ1dGF1cmE=",
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
                            "value": "MjJ1dGF1cmE=",
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
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjJ1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjJ1dGF1cmE=",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eC8xMDM=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "ZXk4b0xWdlpaNmFaUk8yRUFPMWVsZ25kWC92V1ZYanlOek5ZbVQrOU1ZaDkySVhVQzlKUHhKdVN2VE9nYnJRaHJaTXRjNDVuRUhaaVpBNUVaTmx0T3c9PQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "Q2tCN0x5Z3RXOWxucHBsRTdZUUE3VjZXQ2QxZis5WlZlUEkzTTFpWlA3MHhpSDNZaGRRTDBrL0VtNUs5TTZCdXRDR3RreTF6am1jUWRtSmtEa1JrMlcwNw==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "YWN0aW9u",
                            "value": "L2Nvc21vcy5iYW5rLnYxYmV0YTEuTXNnTXVsdGlTZW5k",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTE1MjJhYXZjYWd5cmFoYXl1c3BlNDduZGplN3M2OTRka3pjdXA2eA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_received",
                    "attributes": [
                        {
                            "key": "cmVjZWl2ZXI=",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "transfer",
                    "attributes": [
                        {
                            "key": "cmVjaXBpZW50",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_received",
                    "attributes": [
                        {
                            "key": "cmVjZWl2ZXI=",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "transfer",
                    "attributes": [
                        {
                            "key": "cmVjaXBpZW50",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_received",
                    "attributes": [
                        {
                            "key": "cmVjZWl2ZXI=",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "transfer",
                    "attributes": [
                        {
                            "key": "cmVjaXBpZW50",
                            "value": "YXVyYTFoY3RqM3RwbXVjbXV2MDJ1bWY5MjUyZW5qZWRrY2U3bW1sNjlrOA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MTAwMDB1dGF1cmE=",
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
        },
        "indexes": {
            "timestamp": new Date(prevDate),
            "height": 3458024,
            "coin_spent_spender": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
            ],
            "addresses": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x",
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
            ],
            "coin_spent_amount": [
                "22utaura",
                "30000utaura"
            ],
            "coin_received_receiver": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
            ],
            "coin_received_amount": [
                "22utaura",
                "10000utaura"
            ],
            "transfer_recipient": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1hctj3tpmucmuv02umf9252enjedkce7mml69k8"
            ],
            "transfer_sender": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
            ],
            "transfer_amount": [
                "22utaura",
                "10000utaura"
            ],
            "message_sender": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
            ],
            "tx_fee": [
                "22utaura"
            ],
            "tx_fee_payer": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x"
            ],
            "tx_acc_seq": [
                "aura1522aavcagyrahayuspe47ndje7s694dkzcup6x/103"
            ],
            "tx_signature": [
                "ey8oLVvZZ6aZRO2EAO1elgndX/vWVXjyNzNYmT+9MYh92IXUC9JPxJuSvTOgbrQhrZMtc45nEHZiZA5EZNltOw==",
                "CkB7LygtW9lnpplE7YQA7V6WCd1f+9ZVePI3M1iZP70xiH3YhdQL0k/Em5K9M6ButCGtky1zjmcQdmJkDkRk2W07"
            ],
            "message_action": [
                "/cosmos.bank.v1beta1.MsgMultiSend"
            ],
            "message_module": [
                "bank"
            ]
        },
        "__v": 0
    },
    {
        _id: new Types.ObjectId(),
        tx: {
            data: 'sth'
        },
        tx_response: {
            code: 0,
            txhash: 'c'
        },
        indexes: {
            timestamp: new Date(prevDate)
        }
    },
    {
        _id: new Types.ObjectId(),
        tx: {
            data: 'sth'
        },
        tx_response: {
            code: 0,
            txhash: 'd'
        },
        indexes: {
            timestamp: new Date(prevDate)
        }
    },
    {
        _id: new Types.ObjectId(),
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                        "to_address": "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7",
                        "amount": [
                            {
                                "denom": "utaura",
                                "amount": "1000000"
                            }
                        ]
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
                            "denom": "utaura",
                            "amount": "218"
                        }
                    ],
                    "gas_limit": "86929",
                    "payer": "",
                    "granter": ""
                },
                "signer_infos": [
                    {
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                            }
                        },
                        "public_key": {
                            "@type": "/cosmos.crypto.secp256k1.PubKey",
                            "key": "A4veR43Br9oaixYMZXYaPfnUaVmdXAaBqGqb7Ujgqep2"
                        },
                        "sequence": "150"
                    }
                ]
            },
            "signatures": [
                "faHHOg4DNgHCKlPgES74824oslZI0sC/qriSSw1X5ooAgbYBXYlGOsSey9Lb8oB/0LbK5g8nWgW+yOx0pu20hA=="
            ]
        },
        "custom_info": {
            "chain_id": "aura-testnet-2",
            "chain_name": "Aura devnet"
        },
        "tx_response": {
            "height": 3527725,
            "txhash": "23FDC54364610A2BBCBB0095820EDCA3A1856A2BC4887D939616C036BD7D8538",
            "codespace": "",
            "code": "0",
            "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
            "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7\"},{\"key\":\"sender\",\"value\":\"aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa\"},{\"key\":\"amount\",\"value\":\"1000000utaura\"}]}]}]",
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
                                    "value": "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7"
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
                                    "value": "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7"
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
            "gas_used": "70989",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.bank.v1beta1.MsgSend",
                            "from_address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                            "to_address": "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7",
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
                                    "mode": "SIGN_MODE_LEGACY_AMINO_JSON"
                                }
                            },
                            "sequence": "150"
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
                    "faHHOg4DNgHCKlPgES74824oslZI0sC/qriSSw1X5ooAgbYBXYlGOsSey9Lb8oB/0LbK5g8nWgW+yOx0pu20hA=="
                ]
            },
            "timestamp": new Date(1671704262000),
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
                            "value": "YXVyYTF0MGw3dGpocXZzcHc3bG5zZHI5bDV0OGZ5cXB1dTNqbTU3ZXpxYS8xNTA=",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "ZmFISE9nNEROZ0hDS2xQZ0VTNzQ4MjRvc2xaSTBzQy9xcmlTU3cxWDVvb0FnYllCWFlsR09zU2V5OUxiOG9CLzBMYks1ZzhuV2dXK3lPeDBwdTIwaEE9PQ==",
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
                            "value": "YXVyYTFxYzR5NGF3am14OXpqenFhcHVjcjY2dGR6ZjM0enEwdXhqcmFmNw==",
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
                            "value": "YXVyYTFxYzR5NGF3am14OXpqenFhcHVjcjY2dGR6ZjM0enEwdXhqcmFmNw==",
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
        },
        "indexes": {
            "timestamp": new Date(prevDate),
            "height": 3527725,
            "coin_spent_spender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "addresses": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7"
            ],
            "coin_spent_amount": [
                "218utaura",
                "1000000utaura"
            ],
            "coin_received_receiver": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7"
            ],
            "coin_received_amount": [
                "218utaura",
                "1000000utaura"
            ],
            "transfer_recipient": [
                "aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy",
                "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7"
            ],
            "transfer_sender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "transfer_amount": [
                "218utaura",
                "1000000utaura"
            ],
            "message_sender": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "tx_fee": [
                "218utaura"
            ],
            "tx_fee_payer": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa"
            ],
            "tx_acc_seq": [
                "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa/150"
            ],
            "tx_signature": [
                "faHHOg4DNgHCKlPgES74824oslZI0sC/qriSSw1X5ooAgbYBXYlGOsSey9Lb8oB/0LbK5g8nWgW+yOx0pu20hA=="
            ],
            "message_action": [
                "/cosmos.bank.v1beta1.MsgSend"
            ],
            "message_module": [
                "bank"
            ]
        },
        "__v": 0
    }
];

export const listAccounts = [
    {
        _id: new Types.ObjectId(),
        address: 'a'
    },
    {
        _id: new Types.ObjectId(),
        address: 'b'
    },
    {
        _id: new Types.ObjectId(),
        address: 'c'
    },
];

export const dailyTxStatistic = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    daily_txs: 5,
    daily_active_addresses: 5,
    unique_addresses: 3,
    unique_addresses_increase: 0,
    date: new Date(prevDate),
};

export const accountStatSend = {
    "one_day": {
        "total_sent_tx": {
            "amount": 2,
            "percentage": 66.66666666666667
        },
        "total_received_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_sent_amount": {
            "amount": 2000000,
            "percentage": 98.52216748768473
        },
        "total_received_amount": {
            "amount": 0,
            "percentage": 0
        }
    },
    "three_days": {
        "total_sent_tx": {
            "amount": 2,
            "percentage": 66.66666666666667
        },
        "total_received_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_sent_amount": {
            "amount": 2000000,
            "percentage": 98.52216748768473
        },
        "total_received_amount": {
            "amount": 0,
            "percentage": 0
        }
    },
    "seven_days": {
        "total_sent_tx": {
            "amount": 2,
            "percentage": 66.66666666666667
        },
        "total_received_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_sent_amount": {
            "amount": 2000000,
            "percentage": 98.52216748768473
        },
        "total_received_amount": {
            "amount": 0,
            "percentage": 0
        }
    },
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "address": "aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa",
    "per_day": [
        {
            "total_sent_tx": {
                "amount": 2,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 2000000,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 0,
                "percentage": 0
            }
        }
    ],
    "__v": 0
};

export const accountStatReceive = {
    "one_day": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 20
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 49.26108374384236
        }
    },
    "three_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 20
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 49.26108374384236
        }
    },
    "seven_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 20
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 49.26108374384236
        }
    },
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "address": "aura1c90r52pp5lvfekk7dulc8v00v7uqvy7g7q5hy2",
    "per_day": [
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        }
    ],
    "__v": 0
};

export const accountStat = {
    _id: new Types.ObjectId(),
    "one_day": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    "three_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    "seven_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "address": "aura1qc4y4awjmx9zjzqapucr66tdzf34zq0uxjraf7",
    "per_day": [
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        }
    ],
    "__v": 0
};

export const accountStatRedundant = {
    _id: new Types.ObjectId(),
    "one_day": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    "three_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    "seven_days": {
        "total_sent_tx": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_tx": {
            "amount": 1,
            "percentage": 50
        },
        "total_sent_amount": {
            "amount": 0,
            "percentage": 0
        },
        "total_received_amount": {
            "amount": 1000000,
            "percentage": 50
        }
    },
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "address": "aura136v0nmlv0saryev8wqz89w80edzdu3quzm0ve9",
    "per_day": [
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
        {
            "total_sent_tx": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_tx": {
                "amount": 1,
                "percentage": 0
            },
            "total_sent_amount": {
                "amount": 0,
                "percentage": 0
            },
            "total_received_amount": {
                "amount": 1000000,
                "percentage": 0
            }
        },
    ],
    "__v": 0
};

export const listCw20Asset = [
    {
        _id: new Types.ObjectId(),
        "asset_info": {
            "data": {
                "name": "CoinD",
                "symbol": "CoinD",
                "decimals": 6,
                "total_supply": "5"
            }
        },
        custom_info: {
            chain_id: Config.CHAIN_ID,
            chain_name: "Aura Devnet"
        },
        "history": [],
        "asset_id": "aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm_aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm",
        "code_id": "117",
        "contract_address": "aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm",
        "owner": "aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm",
        "balance": "5",
        "percent_hold": 100,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    },
    {
        _id: new Types.ObjectId(),
        "asset_info": {
            "data": {
                "name": "CDolla",
                "symbol": "CVND",
                "decimals": 6,
                "total_supply": "1000000001"
            }
        },
        custom_info: {
            chain_id: Config.CHAIN_ID,
            chain_name: "Aura Devnet"
        },
        "history": [],
        "asset_id": "aura1auz7cuwpg07w45zh22a8verwnwzz8p39sjaxeqan0v02aahjx63ss43kzw_aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "code_id": "87",
        "contract_address": "aura1auz7cuwpg07w45zh22a8verwnwzz8p39sjaxeqan0v02aahjx63ss43kzw",
        "owner": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "balance": "1000000001",
        "percent_hold": 100,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    },
    {
        _id: new Types.ObjectId(),
        "asset_info": {
            "data": {
                "name": "CDolla",
                "symbol": "CVND",
                "decimals": 6,
                "total_supply": "101"
            }
        },
        custom_info: {
            chain_id: Config.CHAIN_ID,
            chain_name: "Aura Devnet"
        },
        "history": [],
        "asset_id": "aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567_aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "code_id": "117",
        "contract_address": "aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567",
        "owner": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
        "balance": "1",
        "percent_hold": 0.990099,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    },
    {
        _id: new Types.ObjectId(),
        "asset_info": {
            "data": {
                "name": "CDolla",
                "symbol": "CVND",
                "decimals": 6,
                "total_supply": "101"
            }
        },
        custom_info: {
            chain_id: Config.CHAIN_ID,
            chain_name: "Aura Devnet"
        },
        "history": [],
        "asset_id": "aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567_aura1whczpvfx2z79h84yzdlpzad5gwurynredrtcx6",
        "code_id": "117",
        "contract_address": "aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567",
        "owner": "aura1whczpvfx2z79h84yzdlpzad5gwurynredrtcx6",
        "balance": "100",
        "percent_hold": 99.0099,
        "createdAt": new Date(),
        "updatedAt": new Date(),
        "__v": 0
    }
];

export const dailyCw20Holder = {
    _id: new Types.ObjectId(),
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "code_id": 117,
    "contract_address": "aura1rzzr0n0086aqdhgtavyvptxmcqxhke2nv0eke96tguv8a92zzcjscdy567",
    "old_holders": 1,
    "new_holders": 1,
    "change_percent": 0,
    "__v": 0
};

export const dailyCw20HolderOne = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "code_id": 87,
    "contract_address": "aura1auz7cuwpg07w45zh22a8verwnwzz8p39sjaxeqan0v02aahjx63ss43kzw",
    "old_holders": 0,
    "new_holders": 1,
    "change_percent": 0,
    "__v": 0
};

export const dailyCw20HolderTwo = {
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "code_id": 117,
    "contract_address": "aura1cmp22xhzeja97rpffdcnqw027xceakxllfcz7je33fm2guze4jas47k0rm",
    "old_holders": 0,
    "new_holders": 1,
    "change_percent": 0,
    "__v": 0
};
