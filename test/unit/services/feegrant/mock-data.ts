
export const tx_use = {
    "_id": 11,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.bank.v1beta1.MsgSend",
                    "from_address": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "1000"
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "24"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
            }
        },
        "signatures": [
            "JgmtaxJ2y1bKIHXmJcjCKgWyF9VheZkVlzaA7ArKTM5GjXA9U/fTl0EYEeS8UJXUNPSPMv2LfvKtt4hUU4ljAA=="
        ]
    },
    "tx_response": {
        "height": 1262554,
        "txhash": "4CE66C589443419C4057326902C51DCC04B027A6AD52A1C1075E5555A15992BE",
        "codespace": "",
        "code": "0",
        "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"sender\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]}]}]",
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
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
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
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
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
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "sender",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "81895",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "1000"
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "24"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                }
            },
            "signatures": [
                "JgmtaxJ2y1bKIHXmJcjCKgWyF9VheZkVlzaA7ArKTM5GjXA9U/fTl0EYEeS8UJXUNPSPMv2LfvKtt4hUU4ljAA=="
            ]
        },
        "timestamp": "2022-10-05T02:55:47Z",
        "events": [
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC8yNA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "SmdtdGF4SjJ5MWJLSUhYbUpjakNLZ1d5RjlWaGVaa1ZsemFBN0FyS1RNNUdqWEE5VS9mVGwwRVlFZVM4VUpYVU5QU1BNdjJMZnZLdHQ0aFVVNGxqQUE9PQ==",
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
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
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
}

export const tx_create = {
    "_id": 1,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "spend_limit": [
                            {
                                "denom": "ueaura",
                                "amount": "2000"
                            }
                        ],
                        "expiration": null
                    }
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "26"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "qGNp/SlPRQ3vQoogun/zt1MjEzxduQkdPSmrk9R2EE5l0uZKPk0SG77zixlaTTnx2NjJ/D+XphWIysCbhupXQA=="
        ]
    },
    "tx_response": {
        "height": 1262689,
        "txhash": "243EF2A1E124CFE103DA39270C5AC4B7C3E33C8741A04394B398BF91B8DAB8FC",
        "codespace": "",
        "code": "0",
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "grantee",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "68072",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "2000"
                                }
                            ],
                            "expiration": null
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "26"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "qGNp/SlPRQ3vQoogun/zt1MjEzxduQkdPSmrk9R2EE5l0uZKPk0SG77zixlaTTnx2NjJ/D+XphWIysCbhupXQA=="
            ]
        },
        "timestamp": "2022-10-05T03:08:33Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC8yNg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "cUdOcC9TbFBSUTN2UW9vZ3VuL3p0MU1qRXp4ZHVRa2RQU21yazlSMkVFNWwwdVpLUGswU0c3N3ppeGxhVFRueDJOakovRCtYcGhXSXlzQ2JodXBYUUE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_revoke = {
    "_id": 10,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "25"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "0SGXsq0EaltfF+Mv2pYQhrm7yPOTVUbEMOVLJcrnGCZ743qUp7PEV77vPsCI4xP0UlRYuQo51p+700f2Wpie3A=="
        ]
    },
    "tx_response": {
        "height": 1262657,
        "txhash": "F139DA992DFE6BFBBC29BFB93ED0981CF36A24ECC5325C0EBCF081C2A5E270DA",
        "codespace": "",
        "code": "0",
        "data": "0A2D0A2B2F636F736D6F732E6665656772616E742E763162657461312E4D73675265766F6B65416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgRevokeAllowance\"}]},{\"type\":\"revoke_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance"
                            }
                        ]
                    },
                    {
                        "type": "revoke_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "grantee",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "60464",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "25"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "0SGXsq0EaltfF+Mv2pYQhrm7yPOTVUbEMOVLJcrnGCZ743qUp7PEV77vPsCI4xP0UlRYuQo51p+700f2Wpie3A=="
            ]
        },
        "timestamp": "2022-10-05T03:05:31Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC8yNQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "MFNHWHNxMEVhbHRmRitNdjJwWVFocm03eVBPVFZVYkVNT1ZMSmNybkdDWjc0M3FVcDdQRVY3N3ZQc0NJNHhQMFVsUll1UW81MXArNzAwZjJXcGllM0E9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ1Jldm9rZUFsbG93YW5jZQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_create_with_feegrant_then_useup = {
    "_id": 23,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura1g7l9maqfjm6je04y7kmasrj706vvnk6xns4zdm",
                    "grantee": "aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "spend_limit": [
                            {
                                "denom": "ueaura",
                                "amount": "500"
                            }
                        ],
                        "expiration": null
                    }
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
                        "key": "A/XgTaKBg4bSloLiIYM/uHruRFILJjolPsDXSxFIAINg"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "10"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "500"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
            }
        },
        "signatures": [
            "OdNAxt/+1SNQ1Em3sS1KqUM+TiQ88mbEgROhBrUu6aAvc/418OTsfLPgvSiZ4eSQtkdH3+pPO2AIDKChvUbVig=="
        ]
    },
    "tx_response": {
        "height": "2658473",
        "txhash": "E0BC92F06ECB4C2D27DF92436CE1FC55AA7E0E474EE2B6701983173397B5F273",
        "codespace": "",
        "code": 0,
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura1g7l9maqfjm6je04y7kmasrj706vvnk6xns4zdm\"},{\"key\":\"grantee\",\"value\":\"aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura1g7l9maqfjm6je04y7kmasrj706vvnk6xns4zdm"
                            },
                            {
                                "key": "grantee",
                                "value": "aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "72668",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura1g7l9maqfjm6je04y7kmasrj706vvnk6xns4zdm",
                        "grantee": "aura1d3n0v5f23sqzkhlcnewhksaj8l3x7jey8hq0sc",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "utaura",
                                    "amount": "500"
                                }
                            ],
                            "expiration": null
                        }
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
                            "key": "A/XgTaKBg4bSloLiIYM/uHruRFILJjolPsDXSxFIAINg"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "10"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "500"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
                }
            },
            "signatures": [
                "OdNAxt/+1SNQ1Em3sS1KqUM+TiQ88mbEgROhBrUu6aAvc/418OTsfLPgvSiZ4eSQtkdH3+pPO2AIDKChvUbVig=="
            ]
        },
        "timestamp": "2022-11-11T03:54:16Z",
        "events": [
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFnN2w5bWFxZmptNmplMDR5N2ttYXNyajcwNnZ2bms2eG5zNHpkbQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFnN2w5bWFxZmptNmplMDR5N2ttYXNyajcwNnZ2bms2eG5zNHpkbQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTAwdXRhdXJh",
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
                        "value": "NTAwdXRhdXJh",
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
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "NTAwdXRhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "NTAwdXRhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFnN2w5bWFxZmptNmplMDR5N2ttYXNyajcwNnZ2bms2eG5zNHpkbS8xMA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "T2ROQXh0LysxU05RMUVtM3NTMUtxVU0rVGlRODhtYkVnUk9oQnJVdTZhQXZjLzQxOE9Uc2ZMUGd2U2laNGVTUXRrZEgzK3BQTzJBSURLQ2h2VWJWaWc9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTFnN2w5bWFxZmptNmplMDR5N2ttYXNyajcwNnZ2bms2eG5zNHpkbQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFkM24wdjVmMjNzcXpraGxjbmV3aGtzYWo4bDN4N2pleThocTBzYw==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_create_instantiate_specified_contract = {
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
                    "grantee": "aura1p8k9dk0x3r7rlmlnsafzqdrh3dp8nwg8rwxpty",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.AllowedMsgAllowance",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                                "basic": {
                                    "spend_limit": [
                                        {
                                            "denom": "utaura",
                                            "amount": "3000000"
                                        }
                                    ],
                                    "expiration": "2022-12-21T16:59:59Z"
                                },
                                "period": "86400s",
                                "period_spend_limit": [
                                    {
                                        "denom": "utaura",
                                        "amount": "2000000"
                                    }
                                ],
                                "period_can_spend": [
                                    {
                                        "denom": "utaura",
                                        "amount": "2000000"
                                    }
                                ],
                                "period_reset": "2022-12-01T01:25:21Z"
                            },
                            "allowed_messages": [
                                "/cosmwasm.wasm.v1.MsgInstantiateContract",
                                "/cosmwasm.wasm.v1.MsgExecuteContract"
                            ]
                        },
                        "allowed_address": [
                            "aura103f9xxjj9938dh9ghxtet53cat4dl42k2x07l6",
                            "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
                            "aura1h9gmwepxzm2nzl4exalny762xjzvad02zxwejc"
                        ]
                    }
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
                        "key": "A38T6LMB532XQyKdDQOLaUIptluD3old7CWvLMAWE2VU"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "1388"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "utaura",
                        "amount": "1000"
                    }
                ],
                "gas_limit": "400000",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "k1FyZL/t/6Pl5JO6k/62hx0UIxeIG9JHstKd2VKgW49osL0MFv2kmCKQsVu2xKDHMeCWOj/oLCjkav5Pdi1CwQ=="
        ]
    },
    "tx_response": {
        "height": "3051355",
        "txhash": "A02EBB30AA9DC65D979339ECC97049FEB6D4CE0754CCA56CFA1697173D0A76A8",
        "codespace": "",
        "code": 0,
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx\"},{\"key\":\"grantee\",\"value\":\"aura1p8k9dk0x3r7rlmlnsafzqdrh3dp8nwg8rwxpty\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx"
                            },
                            {
                                "key": "grantee",
                                "value": "aura1p8k9dk0x3r7rlmlnsafzqdrh3dp8nwg8rwxpty"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "400000",
        "gas_used": "83640",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
                        "grantee": "aura1p8k9dk0x3r7rlmlnsafzqdrh3dp8nwg8rwxpty",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.AllowedMsgAllowance",
                                "allowance": {
                                    "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                                    "basic": {
                                        "spend_limit": [
                                            {
                                                "denom": "utaura",
                                                "amount": "3000000"
                                            }
                                        ],
                                        "expiration": "2022-12-21T16:59:59Z"
                                    },
                                    "period": "86400s",
                                    "period_spend_limit": [
                                        {
                                            "denom": "utaura",
                                            "amount": "2000000"
                                        }
                                    ],
                                    "period_can_spend": [
                                        {
                                            "denom": "utaura",
                                            "amount": "2000000"
                                        }
                                    ],
                                    "period_reset": "2022-12-01T01:25:21Z"
                                },
                                "allowed_messages": [
                                    "/cosmwasm.wasm.v1.MsgInstantiateContract",
                                    "/cosmwasm.wasm.v1.MsgExecuteContract"
                                ]
                            },
                            "allowed_address": [
                                "aura103f9xxjj9938dh9ghxtet53cat4dl42k2x07l6",
                                "aura1afuqcya9g59v0slx4e930gzytxvpx2c43xhvtx",
                                "aura1h9gmwepxzm2nzl4exalny762xjzvad02zxwejc"
                            ]
                        }
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
                            "key": "A38T6LMB532XQyKdDQOLaUIptluD3old7CWvLMAWE2VU"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "1388"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000"
                        }
                    ],
                    "gas_limit": "400000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "k1FyZL/t/6Pl5JO6k/62hx0UIxeIG9JHstKd2VKgW49osL0MFv2kmCKQsVu2xKDHMeCWOj/oLCjkav5Pdi1CwQ=="
            ]
        },
        "timestamp": "2022-11-30T01:25:24Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHV0YXVyYQ==",
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
                        "value": "MTAwMHV0YXVyYQ==",
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
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MTAwMHV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eC8xMzg4",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "azFGeVpML3QvNlBsNUpPNmsvNjJoeDBVSXhlSUc5SkhzdEtkMlZLZ1c0OW9zTDBNRnYya21DS1FzVnUyeEtESE1lQ1dPai9vTENqa2F2NVBkaTFDd1E9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTFhZnVxY3lhOWc1OXYwc2x4NGU5MzBnenl0eHZweDJjNDN4aHZ0eA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFwOGs5ZGsweDNyN3JsbWxuc2FmenFkcmgzZHA4bndnOHJ3eHB0eQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_revoke_with_feegrant = {
    "_id": 9,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2"
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "42"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
            }
        },
        "signatures": [
            "DOu8o0VZbxrUbzH6D6xl/vMMliPi4dqwS7Xh4evazzgtamF6Jdy3QpgS5V8Cje5r/Q6WGPaJceyav09lgzF9IQ=="
        ]
    },
    "tx_response": {
        "height": 1338935,
        "txhash": "94F41B7F641E7FE272F7ABFF5989C9BA3240EF848A44294245BD923C86536C7A",
        "codespace": "",
        "code": "0",
        "data": "0A2D0A2B2F636F736D6F732E6665656772616E742E763162657461312E4D73675265766F6B65416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgRevokeAllowance\"}]},{\"type\":\"revoke_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance"
                            }
                        ]
                    },
                    {
                        "type": "revoke_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "grantee",
                                "value": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "70819",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2"
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "42"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                }
            },
            "signatures": [
                "DOu8o0VZbxrUbzH6D6xl/vMMliPi4dqwS7Xh4evazzgtamF6Jdy3QpgS5V8Cje5r/Q6WGPaJceyav09lgzF9IQ=="
            ]
        },
        "timestamp": "2022-10-10T03:30:33Z",
        "events": [
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC80Mg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "RE91OG8wVlpieHJVYnpINkQ2eGwvdk1NbGlQaTRkcXdTN1hoNGV2YXp6Z3RhbUY2SmR5M1FwZ1M1VjhDamU1ci9RNldHUGFKY2V5YXYwOWxnekY5SVE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ1Jldm9rZUFsbG93YW5jZQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTE4bWx6a21tbnVrNHQ0NHM1MnVsZXgwNzB0Yzd4eXJybXF1NWt1Mg==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_revoke_with_feegrant_then_useup = {
    "_id": 22,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                    "granter": "aura1td8tqeup7kvz3hxhckrej746d822m9naq70w6y",
                    "grantee": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
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
                        "key": "Ay7cQsxOTq4wexPpf7aTOBqtXy5EDTeaJ9Yp/NmSG95T"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "1"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "1000"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
            }
        },
        "signatures": [
            "o6AJqwUQxebc6MsMp3DGEkuZdfMjLpFqCn/NrR5BYcdT9iNxoKwFACvwfPS6FD4cbLVh1CeBY259DaTBcvpyEA=="
        ]
    },
    "tx_response": {
        "height": "2657795",
        "txhash": "F2978E8CC0A83E5AD3FCAB62D0A783B474F05227FDA024273E508915C6C75E22",
        "codespace": "",
        "code": 0,
        "data": "0A2D0A2B2F636F736D6F732E6665656772616E742E763162657461312E4D73675265766F6B65416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgRevokeAllowance\"}]},{\"type\":\"revoke_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura1td8tqeup7kvz3hxhckrej746d822m9naq70w6y\"},{\"key\":\"grantee\",\"value\":\"aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance"
                            }
                        ]
                    },
                    {
                        "type": "revoke_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura1td8tqeup7kvz3hxhckrej746d822m9naq70w6y"
                            },
                            {
                                "key": "grantee",
                                "value": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "64195",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                        "granter": "aura1td8tqeup7kvz3hxhckrej746d822m9naq70w6y",
                        "grantee": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
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
                            "key": "Ay7cQsxOTq4wexPpf7aTOBqtXy5EDTeaJ9Yp/NmSG95T"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "1"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "utaura",
                            "amount": "1000"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura12054zwwajdj6ujna9xjhe2umhkaha0yc6zvlf9"
                }
            },
            "signatures": [
                "o6AJqwUQxebc6MsMp3DGEkuZdfMjLpFqCn/NrR5BYcdT9iNxoKwFACvwfPS6FD4cbLVh1CeBY259DaTBcvpyEA=="
            ]
        },
        "timestamp": "2022-11-11T03:08:11Z",
        "events": [
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTF0ZDh0cWV1cDdrdnozaHhoY2tyZWo3NDZkODIybTluYXE3MHc2eQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTF0ZDh0cWV1cDdrdnozaHhoY2tyZWo3NDZkODIybTluYXE3MHc2eQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHV0YXVyYQ==",
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
                        "value": "MTAwMHV0YXVyYQ==",
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
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHV0YXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MTAwMHV0YXVyYQ==",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTF0ZDh0cWV1cDdrdnozaHhoY2tyZWo3NDZkODIybTluYXE3MHc2eS8x",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "bzZBSnF3VVF4ZWJjNk1zTXAzREdFa3VaZGZNakxwRnFDbi9OclI1QlljZFQ5aU54b0t3RkFDdndmUFM2RkQ0Y2JMVmgxQ2VCWTI1OURhVEJjdnB5RUE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ1Jldm9rZUFsbG93YW5jZQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTF0ZDh0cWV1cDdrdnozaHhoY2tyZWo3NDZkODIybTluYXE3MHc2eQ==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEyMDU0end3YWpkajZ1am5hOXhqaGUydW1oa2FoYTB5YzZ6dmxmOQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_create_with_feegrant = {
    "_id": 2,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "spend_limit": [
                            {
                                "denom": "ueaura",
                                "amount": "1000"
                            }
                        ],
                        "expiration": null
                    }
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "38"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
            }
        },
        "signatures": [
            "fX9fDwUmj7p5AlTZmCmCfWuX3P5eypolS+5vsTvTeF5aOfnCIYcDG03OF9wbHVSdw6E1pUBfLHe54NTtIzvzAQ=="
        ]
    },
    "tx_response": {
        "height": 1293212,
        "txhash": "37A071BC61D43DADBA617EB5E7D38BE0721DEE67AE129D456B74A4811E542495",
        "codespace": "",
        "code": "0",
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            },
                            {
                                "key": "grantee",
                                "value": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "79333",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "1000"
                                }
                            ],
                            "expiration": null
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "38"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                }
            },
            "signatures": [
                "fX9fDwUmj7p5AlTZmCmCfWuX3P5eypolS+5vsTvTeF5aOfnCIYcDG03OF9wbHVSdw6E1pUBfLHe54NTtIzvzAQ=="
            ]
        },
        "timestamp": "2022-10-07T03:20:14Z",
        "events": [
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC8zOA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "Zlg5ZkR3VW1qN3A1QWxUWm1DbUNmV3VYM1A1ZXlwb2xTKzV2c1R2VGVGNWFPZm5DSVljREcwM09GOXdiSFZTZHc2RTFwVUJmTEhlNTROVHRJenZ6QVE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTE4bWx6a21tbnVrNHQ0NHM1MnVsZXgwNzB0Yzd4eXJybXF1NWt1Mg==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_use_up = {
    "_id": 12,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.bank.v1beta1.MsgSend",
                    "from_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                    "to_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "1000"
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
                        "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "16"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "1600"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
            }
        },
        "signatures": [
            "Ybu7GVeS4QwQ6OQvCIxsWsl7UOx089SvocpopZFBQVxYvwuOR2TC+7n6tq1h0NRFIKPEgHSoL1MMPPF9M6qZZA=="
        ]
    },
    "tx_response": {
        "height": 1292889,
        "txhash": "E22F876F4AF7F5FCAE1DF631A62EC84F82951B385F936023D88C71A8EA7CA550",
        "codespace": "",
        "code": "0",
        "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
        "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"sender\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"amount\",\"value\":\"1000ueaura\"}]}]}]",
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
                                "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
                            }
                        ]
                    },
                    {
                        "type": "coin_spent",
                        "attributes": [
                            {
                                "key": "spender",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
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
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
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
                                "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                            },
                            {
                                "key": "sender",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "amount",
                                "value": "1000ueaura"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "75154",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "to_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "1000"
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
                            "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "16"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "1600"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                }
            },
            "signatures": [
                "Ybu7GVeS4QwQ6OQvCIxsWsl7UOx089SvocpopZFBQVxYvwuOR2TC+7n6tq1h0NRFIKPEgHSoL1MMPPF9M6qZZA=="
            ]
        },
        "timestamp": "2022-10-07T02:49:43Z",
        "events": [
            {
                "type": "revoke_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTYwMHVlYXVyYQ==",
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
                        "value": "MTYwMHVlYXVyYQ==",
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
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTYwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MTYwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwci8xNg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "WWJ1N0dWZVM0UXdRNk9RdkNJeHNXc2w3VU94MDg5U3ZvY3BvcFpGQlFWeFl2d3VPUjJUQys3bjZ0cTFoME5SRklLUEVnSFNvTDFNTVBQRjlNNnFaWkE9PQ==",
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
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_received",
                "attributes": [
                    {
                        "key": "cmVjZWl2ZXI=",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "transfer",
                "attributes": [
                    {
                        "key": "cmVjaXBpZW50",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MTAwMHVlYXVyYQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
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
}

export const tx_create_but_existed = {
    "_id": 3,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                        "spend_limit": [
                            {
                                "denom": "ueaura",
                                "amount": "3000"
                            }
                        ],
                        "expiration": null
                    }
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
                        "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "41"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
            }
        },
        "signatures": [
            "kH0yko/WWBiOXg7EP1KexxdWjPLamZ4VDpmtyfbdLg4N4vASQLagwELVwzTsPYsA4mw7Hdt5bbWBd0fUkzRN8g=="
        ]
    },
    "tx_response": {
        "height": 1293608,
        "txhash": "B38768A44F3C3ADD5B15A1560901569DB07A85443343FE5E64F850A1C8F50B66",
        "codespace": "sdk",
        "code": "18",
        "data": "",
        "raw_log": "failed to execute message; message index: 0: fee allowance already exists: invalid request",
        "logs": [],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "70468",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura18mlzkmmnuk4t44s52ulex070tc7xyrrmqu5ku2",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "3000"
                                }
                            ],
                            "expiration": null
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "41"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                }
            },
            "signatures": [
                "kH0yko/WWBiOXg7EP1KexxdWjPLamZ4VDpmtyfbdLg4N4vASQLagwELVwzTsPYsA4mw7Hdt5bbWBd0fUkzRN8g=="
            ]
        },
        "timestamp": "2022-10-07T03:58:02Z",
        "events": [
            {
                "type": "use_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC80MQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "a0gweWtvL1dXQmlPWGc3RVAxS2V4eGRXalBMYW1aNFZEcG10eWZiZExnNE40dkFTUUxhZ3dFTFZ3elRzUFlzQTRtdzdIZHQ1YmJXQmQwZlVrelJOOGc9PQ==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_create_period = {
    "_id": 4,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                    "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                        "basic": {
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "2000"
                                }
                            ],
                            "expiration": null
                        },
                        "period": "3600s",
                        "period_spend_limit": [
                            {
                                "denom": "ueaura",
                                "amount": "600"
                            }
                        ],
                        "period_can_spend": [
                            {
                                "denom": "ueaura",
                                "amount": "600"
                            }
                        ],
                        "period_reset": "2022-10-27T04:13:50.128130800Z"
                    }
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
                        "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "26"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "/1/Qp8yO4j0i8RmiQVgeerm+DIAii4dQrDH+/KDy9mYZx5w8pArzsV9AcnTYJnSSeqFXzkiPZpFzhElNctpX1Q=="
        ]
    },
    "tx_response": {
        "height": 1596987,
        "txhash": "DD4A1D1372E8E6C9F8290552A11FFC3998AD5854AC700C8E56EFC9BA1EDC5C8F",
        "codespace": "",
        "code": "0",
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"grantee\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "grantee",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "70192",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                            "basic": {
                                "spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "2000"
                                    }
                                ],
                                "expiration": null
                            },
                            "period": "3600s",
                            "period_spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "600"
                                }
                            ],
                            "period_can_spend": [
                                {
                                    "denom": "ueaura",
                                    "amount": "600"
                                }
                            ],
                            "period_reset": "2022-10-27T04:13:50.128130800Z"
                        }
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
                            "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "26"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "/1/Qp8yO4j0i8RmiQVgeerm+DIAii4dQrDH+/KDy9mYZx5w8pArzsV9AcnTYJnSSeqFXzkiPZpFzhElNctpX1Q=="
            ]
        },
        "timestamp": "2022-10-27T03:13:50Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwci8yNg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "LzEvUXA4eU80ajBpOFJtaVFWZ2Vlcm0rRElBaWk0ZFFyREgrL0tEeTltWVp4NXc4cEFyenNWOUFjblRZSm5TU2VxRlh6a2lQWnBGemhFbE5jdHBYMVE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

export const tx_create_period_contract = {
    "_id": 5,
    "indexes": {},
    "custom_info": {
        "chain_id": "euphoria-1",
        "chain_name": "Aura Euphoria"
    },
    "tx": {
        "body": {
            "messages": [
                {
                    "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                    "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                    "allowance": {
                        "@type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                            "basic": {
                                "spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "2000"
                                    }
                                ],
                                "expiration": null
                            },
                            "period": "3600s",
                            "period_spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "600"
                                }
                            ],
                            "period_can_spend": [
                                {
                                    "denom": "ueaura",
                                    "amount": "600"
                                }
                            ],
                            "period_reset": "2022-10-27T04:17:44.069148Z"
                        },
                        "allowed_address": [
                            "aura1ex7skwluuvuw72978nnf55e0zws4a6pnrchaxvvxzhcmka39n70qa82m75"
                        ]
                    }
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
                        "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                    },
                    "mode_info": {
                        "single": {
                            "mode": "SIGN_MODE_DIRECT"
                        }
                    },
                    "sequence": "28"
                }
            ],
            "fee": {
                "amount": [
                    {
                        "denom": "ueaura",
                        "amount": "200"
                    }
                ],
                "gas_limit": "200000",
                "payer": "",
                "granter": ""
            }
        },
        "signatures": [
            "qYY/FFi5dTmMcmx6hvEWtwF5JLR4/tAQAFmB2udzrjoSnsTMDSevxpedFwgLH+pnMGMA9NBzRyXRevVBQxtKlA=="
        ]
    },
    "tx_response": {
        "height": 1597028,
        "txhash": "C46AC8D198D030F41C19DB4BE465E942CC5BD276F6BCDB3A2DDB7EFB2F6EC5C0",
        "codespace": "",
        "code": "0",
        "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
        "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"grantee\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"}]}]}]",
        "logs": [
            {
                "msg_index": 0,
                "log": "",
                "events": [
                    {
                        "type": "message",
                        "attributes": [
                            {
                                "key": "action",
                                "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                            }
                        ]
                    },
                    {
                        "type": "set_feegrant",
                        "attributes": [
                            {
                                "key": "granter",
                                "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                            },
                            {
                                "key": "grantee",
                                "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                            }
                        ]
                    }
                ]
            }
        ],
        "info": "",
        "gas_wanted": "200000",
        "gas_used": "75033",
        "tx": {
            "@type": "/cosmos.tx.v1beta1.Tx",
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "grantee": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.AllowedContractAllowance",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.PeriodicAllowance",
                                "basic": {
                                    "spend_limit": [
                                        {
                                            "denom": "ueaura",
                                            "amount": "2000"
                                        }
                                    ],
                                    "expiration": null
                                },
                                "period": "3600s",
                                "period_spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "600"
                                    }
                                ],
                                "period_can_spend": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "600"
                                    }
                                ],
                                "period_reset": "2022-10-27T04:17:44.069148Z"
                            },
                            "allowed_address": [
                                "aura1ex7skwluuvuw72978nnf55e0zws4a6pnrchaxvvxzhcmka39n70qa82m75"
                            ]
                        }
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
                            "key": "A0L0lgFBU+5UEe5I9tpvxwEzYeMpP2Old/hKEURIFnCf"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "28"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "qYY/FFi5dTmMcmx6hvEWtwF5JLR4/tAQAFmB2udzrjoSnsTMDSevxpedFwgLH+pnMGMA9NBzRyXRevVBQxtKlA=="
            ]
        },
        "timestamp": "2022-10-27T03:17:44Z",
        "events": [
            {
                "type": "coin_spent",
                "attributes": [
                    {
                        "key": "c3BlbmRlcg==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
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
                        "value": "MjAwdWVhdXJh",
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
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "YW1vdW50",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "c2VuZGVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "ZmVl",
                        "value": "MjAwdWVhdXJh",
                        "index": true
                    },
                    {
                        "key": "ZmVlX3BheWVy",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "YWNjX3NlcQ==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwci8yOA==",
                        "index": true
                    }
                ]
            },
            {
                "type": "tx",
                "attributes": [
                    {
                        "key": "c2lnbmF0dXJl",
                        "value": "cVlZL0ZGaTVkVG1NY214Nmh2RVd0d0Y1SkxSNC90QVFBRm1CMnVkenJqb1Nuc1RNRFNldnhwZWRGd2dMSCtwbk1HTUE5TkJ6UnlYUmV2VkJReHRLbEE9PQ==",
                        "index": true
                    }
                ]
            },
            {
                "type": "message",
                "attributes": [
                    {
                        "key": "YWN0aW9u",
                        "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                        "index": true
                    }
                ]
            },
            {
                "type": "set_feegrant",
                "attributes": [
                    {
                        "key": "Z3JhbnRlcg==",
                        "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                        "index": true
                    },
                    {
                        "key": "Z3JhbnRlZQ==",
                        "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                        "index": true
                    }
                ]
            }
        ]
    }
}

// granter: aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el
// grantee: aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr
export const listTxFromPairGranterGrantee = {
    "tx_revoke": {
        "_id": 13,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "55"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "CfM324HwYFkqPHMrvZ1B10KuIqULmDGi9FJUowrUbcI2XPU7ulmpkZVXj/llmSmCvKa8xgCKJA4g0ypAeicf1A=="
            ]
        },
        "tx_response": {
            "height": 1612439,
            "txhash": "BC2C321D5D7B13AFEE1C104D08B3B53703E11EEDE076CC5DC7483927E62BB195",
            "codespace": "",
            "code": "0",
            "data": "0A2D0A2B2F636F736D6F732E6665656772616E742E763162657461312E4D73675265766F6B65416C6C6F77616E6365",
            "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgRevokeAllowance\"}]},{\"type\":\"revoke_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"}]}]}]",
            "logs": [
                {
                    "msg_index": 0,
                    "log": "",
                    "events": [
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance"
                                }
                            ]
                        },
                        {
                            "type": "revoke_feegrant",
                            "attributes": [
                                {
                                    "key": "granter",
                                    "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                                },
                                {
                                    "key": "grantee",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "59684",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                            "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                                "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "55"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": ""
                    }
                },
                "signatures": [
                    "CfM324HwYFkqPHMrvZ1B10KuIqULmDGi9FJUowrUbcI2XPU7ulmpkZVXj/llmSmCvKa8xgCKJA4g0ypAeicf1A=="
                ]
            },
            "timestamp": "2022-10-28T03:41:38Z",
            "events": [
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC81NQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "Q2ZNMzI0SHdZRmtxUEhNcnZaMUIxMEt1SXFVTG1ER2k5RkpVb3dyVWJjSTJYUFU3dWxtcGtaVlhqL2xsbVNtQ3ZLYTh4Z0NLSkE0ZzB5cEFlaWNmMUE9PQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "YWN0aW9u",
                            "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ1Jldm9rZUFsbG93YW5jZQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "revoke_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                }
            ]
        }
    },
    "tx_create": {
        "_id": 6,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "1000"
                                }
                            ],
                            "expiration": "2022-12-30T15:04:05Z"
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "56"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "42ZONqgmwUiQKMeXO00RNc1btdsrCXx38adOVt+Ejpp+yK5xb9ty7SpeONSbbQDryCz35DWvhuRciaJOFEx9rw=="
            ]
        },
        "tx_response": {
            "height": 1612470,
            "txhash": "132A20FAECAF1A9D884F8C6BA9CA73139336A53655574F47DB7B6EC5ABA25020",
            "codespace": "",
            "code": "0",
            "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
            "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"}]}]}]",
            "logs": [
                {
                    "msg_index": 0,
                    "log": "",
                    "events": [
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                                }
                            ]
                        },
                        {
                            "type": "set_feegrant",
                            "attributes": [
                                {
                                    "key": "granter",
                                    "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                                },
                                {
                                    "key": "grantee",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "68353",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                            "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                                "spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "1000"
                                    }
                                ],
                                "expiration": "2022-12-30T15:04:05Z"
                            }
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
                                "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "56"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": ""
                    }
                },
                "signatures": [
                    "42ZONqgmwUiQKMeXO00RNc1btdsrCXx38adOVt+Ejpp+yK5xb9ty7SpeONSbbQDryCz35DWvhuRciaJOFEx9rw=="
                ]
            },
            "timestamp": "2022-10-28T03:44:34Z",
            "events": [
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC81Ng==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "NDJaT05xZ213VWlRS01lWE8wMFJOYzFidGRzckNYeDM4YWRPVnQrRWpwcCt5SzV4Yjl0eTdTcGVPTlNiYlFEcnlDejM1RFd2aHVSY2lhSk9GRXg5cnc9PQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "YWN0aW9u",
                            "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "set_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                }
            ]
        }
    },
    "tx_use": {
        "_id": 14,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "300"
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
                            "key": "ArmZNbV92yYgpncVGeuhKQfiDD3wAvlBKz7fraNF7HD9"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "12"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                }
            },
            "signatures": [
                "a/5OZdnn+zrNVMg53o+tc8oQ+dq2UoZbP3nEs6xKcZ90Yo6AJJjm4NLGsCJ4sbluefyMEMfSBlTVLBBsL9rTPA=="
            ]
        },
        "tx_response": {
            "height": 1612502,
            "txhash": "9E4675728C45CC88F95A5A5E0B7017AFA30A9408573F014388DE1E2FBCD67D78",
            "codespace": "",
            "code": "0",
            "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
            "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"sender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]}]}]",
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
                                    "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
                                }
                            ]
                        },
                        {
                            "type": "coin_spent",
                            "attributes": [
                                {
                                    "key": "spender",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
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
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                                    "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                                },
                                {
                                    "key": "sender",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "82212",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.bank.v1beta1.MsgSend",
                            "from_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                            "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                            "amount": [
                                {
                                    "denom": "ueaura",
                                    "amount": "300"
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
                                "key": "ArmZNbV92yYgpncVGeuhKQfiDD3wAvlBKz7fraNF7HD9"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "12"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                    }
                },
                "signatures": [
                    "a/5OZdnn+zrNVMg53o+tc8oQ+dq2UoZbP3nEs6xKcZ90Yo6AJJjm4NLGsCJ4sbluefyMEMfSBlTVLBBsL9rTPA=="
                ]
            },
            "timestamp": "2022-10-28T03:47:38Z",
            "events": [
                {
                    "type": "use_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "set_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2ci8xMg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "YS81T1pkbm4renJOVk1nNTNvK3RjOG9RK2RxMlVvWmJQM25FczZ4S2NaOTBZbzZBSkpqbTROTEdzQ0o0c2JsdWVmeU1FTWZTQmxUVkxCQnNMOXJUUEE9PQ==",
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
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_received",
                    "attributes": [
                        {
                            "key": "cmVjZWl2ZXI=",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "transfer",
                    "attributes": [
                        {
                            "key": "cmVjaXBpZW50",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
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
    },
    "tx_create_grant_but_existed": {
        "_id": 7,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "1000"
                                }
                            ],
                            "expiration": "2022-12-30T15:04:05Z"
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "57"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": ""
                }
            },
            "signatures": [
                "lWJD7d7pvE/yNcl6A0kFuNifpGbWel86+jFkxFh86H4SeoT+EpFTwVYuh3DPDplZmk1KkW/knJQOr+VtUUlOrw=="
            ]
        },
        "tx_response": {
            "height": 1612540,
            "txhash": "BC4D4F7E1F78B17393A448876DD634F43DB7EC933A67684C8E3F077DAA35881B",
            "codespace": "sdk",
            "code": "18",
            "data": "",
            "raw_log": "failed to execute message; message index: 0: fee allowance already exists: invalid request",
            "logs": [],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "59230",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                            "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                                "spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "1000"
                                    }
                                ],
                                "expiration": "2022-12-30T15:04:05Z"
                            }
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
                                "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "57"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": ""
                    }
                },
                "signatures": [
                    "lWJD7d7pvE/yNcl6A0kFuNifpGbWel86+jFkxFh86H4SeoT+EpFTwVYuh3DPDplZmk1KkW/knJQOr+VtUUlOrw=="
                ]
            },
            "timestamp": "2022-10-28T03:51:16Z",
            "events": [
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC81Nw==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "bFdKRDdkN3B2RS95TmNsNkEwa0Z1TmlmcEdiV2VsODYrakZreEZoODZINFNlb1QrRXBGVHdWWXVoM0RQRHBsWm1rMUtrVy9rbkpRT3IrVnRVVWxPcnc9PQ==",
                            "index": true
                        }
                    ]
                }
            ]
        }
    },
    "tx_use_up": {
        "_id": 15,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        "from_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "300"
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
                            "key": "ArmZNbV92yYgpncVGeuhKQfiDD3wAvlBKz7fraNF7HD9"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "13"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "800"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                }
            },
            "signatures": [
                "TqmMFs7dziY4z3P+zbckl5OpMhuhoT9JwcGofgQqgBZa8i2xHIC2v+4ovnFjPP4seqi9C9REjAfwV5OWIQ30sw=="
            ]
        },
        "tx_response": {
            "height": 1612569,
            "txhash": "CB759540B027E376B1909913ED32C0140432711608DF1074EE017EAACC04B64F",
            "codespace": "",
            "code": "0",
            "data": "0A1E0A1C2F636F736D6F732E62616E6B2E763162657461312E4D736753656E64",
            "raw_log": "[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]},{\"type\":\"coin_spent\",\"attributes\":[{\"key\":\"spender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]},{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.bank.v1beta1.MsgSend\"},{\"key\":\"sender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"module\",\"value\":\"bank\"}]},{\"type\":\"transfer\",\"attributes\":[{\"key\":\"recipient\",\"value\":\"aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr\"},{\"key\":\"sender\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"},{\"key\":\"amount\",\"value\":\"300ueaura\"}]}]}]",
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
                                    "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
                                }
                            ]
                        },
                        {
                            "type": "coin_spent",
                            "attributes": [
                                {
                                    "key": "spender",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
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
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                                    "value": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                                },
                                {
                                    "key": "sender",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                },
                                {
                                    "key": "amount",
                                    "value": "300ueaura"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "75245",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.bank.v1beta1.MsgSend",
                            "from_address": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                            "to_address": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr",
                            "amount": [
                                {
                                    "denom": "ueaura",
                                    "amount": "300"
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
                                "key": "ArmZNbV92yYgpncVGeuhKQfiDD3wAvlBKz7fraNF7HD9"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "13"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "800"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                    }
                },
                "signatures": [
                    "TqmMFs7dziY4z3P+zbckl5OpMhuhoT9JwcGofgQqgBZa8i2xHIC2v+4ovnFjPP4seqi9C9REjAfwV5OWIQ30sw=="
                ]
            },
            "timestamp": "2022-10-28T03:54:00Z",
            "events": [
                {
                    "type": "revoke_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "use_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "ODAwdWVhdXJh",
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
                            "value": "ODAwdWVhdXJh",
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
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "ODAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "ODAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2ci8xMw==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "VHFtTUZzN2R6aVk0ejNQK3piY2tsNU9wTWh1aG9UOUp3Y0dvZmdRcWdCWmE4aTJ4SElDMnYrNG92bkZqUFA0c2VxaTlDOVJFakFmd1Y1T1dJUTMwc3c9PQ==",
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
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_received",
                    "attributes": [
                        {
                            "key": "cmVjZWl2ZXI=",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "transfer",
                    "attributes": [
                        {
                            "key": "cmVjaXBpZW50",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MzAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
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
    },
    "tx_create_with_feegrant": {
        "_id": 8,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                        "allowance": {
                            "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                            "spend_limit": [
                                {
                                    "denom": "ueaura",
                                    "amount": "1000"
                                }
                            ],
                            "expiration": "2022-12-30T15:04:05Z"
                        }
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "59"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                }
            },
            "signatures": [
                "pRiP6++JEkXp7PCbMyOLEx8Cqw7M6VKaiHz/pCMLghkYFvmY+mwMVgBJOegIRjdXOBDJCBw69yOkhi8vVSxb6w=="
            ]
        },
        "tx_response": {
            "height": 1612679,
            "txhash": "3095A2646E2252275B7F10D9D92E4CDDBF1ED30B85CB6E8762F7F312123C2841",
            "codespace": "",
            "code": "0",
            "data": "0A2C0A2A2F636F736D6F732E6665656772616E742E763162657461312E4D73674772616E74416C6C6F77616E6365",
            "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgGrantAllowance\"}]},{\"type\":\"set_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"}]}]}]",
            "logs": [
                {
                    "msg_index": 0,
                    "log": "",
                    "events": [
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/cosmos.feegrant.v1beta1.MsgGrantAllowance"
                                }
                            ]
                        },
                        {
                            "type": "set_feegrant",
                            "attributes": [
                                {
                                    "key": "granter",
                                    "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                                },
                                {
                                    "key": "grantee",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "79986",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                            "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr",
                            "allowance": {
                                "@type": "/cosmos.feegrant.v1beta1.BasicAllowance",
                                "spend_limit": [
                                    {
                                        "denom": "ueaura",
                                        "amount": "1000"
                                    }
                                ],
                                "expiration": "2022-12-30T15:04:05Z"
                            }
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
                                "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "59"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                    }
                },
                "signatures": [
                    "pRiP6++JEkXp7PCbMyOLEx8Cqw7M6VKaiHz/pCMLghkYFvmY+mwMVgBJOegIRjdXOBDJCBw69yOkhi8vVSxb6w=="
                ]
            },
            "timestamp": "2022-10-28T04:04:26Z",
            "events": [
                {
                    "type": "use_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "set_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC81OQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "cFJpUDYrK0pFa1hwN1BDYk15T0xFeDhDcXc3TTZWS2FpSHovcENNTGdoa1lGdm1ZK213TVZnQkpPZWdJUmpkWE9CREpDQnc2OXlPa2hpOHZWU3hiNnc9PQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "YWN0aW9u",
                            "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ0dyYW50QWxsb3dhbmNl",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "set_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                }
            ]
        }
    },
    "revoke_with_feegrant": {
        "_id": 17,
        "indexes": {},
        "custom_info": {
            "chain_id": "euphoria-1",
            "chain_name": "Aura Euphoria"
        },
        "tx": {
            "body": {
                "messages": [
                    {
                        "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                        "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                        "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                            "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                        },
                        "mode_info": {
                            "single": {
                                "mode": "SIGN_MODE_DIRECT"
                            }
                        },
                        "sequence": "60"
                    }
                ],
                "fee": {
                    "amount": [
                        {
                            "denom": "ueaura",
                            "amount": "200"
                        }
                    ],
                    "gas_limit": "200000",
                    "payer": "",
                    "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                }
            },
            "signatures": [
                "qt9Y9QhlbLmxq4TTIruzBOfwmDpyjXgYSPG2018C1XsF7+qDPj/a/WmlvgYaxhWMtT4SWuOp/Eo10QCE+ceHnA=="
            ]
        },
        "tx_response": {
            "height": 1612708,
            "txhash": "E66BFB84A4B09A8E04CC96A82C7E46F7F5881EF4229F08A61DBBDDAE3AE30E7A",
            "codespace": "",
            "code": "0",
            "data": "0A2D0A2B2F636F736D6F732E6665656772616E742E763162657461312E4D73675265766F6B65416C6C6F77616E6365",
            "raw_log": "[{\"events\":[{\"type\":\"message\",\"attributes\":[{\"key\":\"action\",\"value\":\"/cosmos.feegrant.v1beta1.MsgRevokeAllowance\"}]},{\"type\":\"revoke_feegrant\",\"attributes\":[{\"key\":\"granter\",\"value\":\"aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el\"},{\"key\":\"grantee\",\"value\":\"aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr\"}]}]}]",
            "logs": [
                {
                    "msg_index": 0,
                    "log": "",
                    "events": [
                        {
                            "type": "message",
                            "attributes": [
                                {
                                    "key": "action",
                                    "value": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance"
                                }
                            ]
                        },
                        {
                            "type": "revoke_feegrant",
                            "attributes": [
                                {
                                    "key": "granter",
                                    "value": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el"
                                },
                                {
                                    "key": "grantee",
                                    "value": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
                                }
                            ]
                        }
                    ]
                }
            ],
            "info": "",
            "gas_wanted": "200000",
            "gas_used": "71173",
            "tx": {
                "@type": "/cosmos.tx.v1beta1.Tx",
                "body": {
                    "messages": [
                        {
                            "@type": "/cosmos.feegrant.v1beta1.MsgRevokeAllowance",
                            "granter": "aura13w7c5u0vwqh350jq8qp75ffx4u0utnc7qcy5el",
                            "grantee": "aura1086crld2mmg4w46lgp48u7eyrhdlk4fh6978vr"
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
                                "key": "A2yjCZ9hKn9rnKheyc4Zv7hQtrkJgiuecexPKo22wutk"
                            },
                            "mode_info": {
                                "single": {
                                    "mode": "SIGN_MODE_DIRECT"
                                }
                            },
                            "sequence": "60"
                        }
                    ],
                    "fee": {
                        "amount": [
                            {
                                "denom": "ueaura",
                                "amount": "200"
                            }
                        ],
                        "gas_limit": "200000",
                        "payer": "",
                        "granter": "aura1awy6asqvum0u7jf954u049sn6zap6x7t0znkpr"
                    }
                },
                "signatures": [
                    "qt9Y9QhlbLmxq4TTIruzBOfwmDpyjXgYSPG2018C1XsF7+qDPj/a/WmlvgYaxhWMtT4SWuOp/Eo10QCE+ceHnA=="
                ]
            },
            "timestamp": "2022-10-28T04:07:12Z",
            "events": [
                {
                    "type": "use_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "set_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "coin_spent",
                    "attributes": [
                        {
                            "key": "c3BlbmRlcg==",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
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
                            "value": "MjAwdWVhdXJh",
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
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        },
                        {
                            "key": "YW1vdW50",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "c2VuZGVy",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "ZmVl",
                            "value": "MjAwdWVhdXJh",
                            "index": true
                        },
                        {
                            "key": "ZmVlX3BheWVy",
                            "value": "YXVyYTFhd3k2YXNxdnVtMHU3amY5NTR1MDQ5c242emFwNng3dDB6bmtwcg==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "YWNjX3NlcQ==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbC82MA==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "tx",
                    "attributes": [
                        {
                            "key": "c2lnbmF0dXJl",
                            "value": "cXQ5WTlRaGxiTG14cTRUVElydXpCT2Z3bURweWpYZ1lTUEcyMDE4QzFYc0Y3K3FEUGovYS9XbWx2Z1lheGhXTXRUNFNXdU9wL0VvMTBRQ0UrY2VIbkE9PQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "message",
                    "attributes": [
                        {
                            "key": "YWN0aW9u",
                            "value": "L2Nvc21vcy5mZWVncmFudC52MWJldGExLk1zZ1Jldm9rZUFsbG93YW5jZQ==",
                            "index": true
                        }
                    ]
                },
                {
                    "type": "revoke_feegrant",
                    "attributes": [
                        {
                            "key": "Z3JhbnRlcg==",
                            "value": "YXVyYTEzdzdjNXUwdndxaDM1MGpxOHFwNzVmZng0dTB1dG5jN3FjeTVlbA==",
                            "index": true
                        },
                        {
                            "key": "Z3JhbnRlZQ==",
                            "value": "YXVyYTEwODZjcmxkMm1tZzR3NDZsZ3A0OHU3ZXlyaGRsazRmaDY5Nzh2cg==",
                            "index": true
                        }
                    ]
                }
            ]
        }
    }
}