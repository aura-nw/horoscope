import { INetworkInfo } from 'types';

// export const networkFile:

export const URL_TYPE_CONSTANTS = {
	LCD: 'LCD',
	RPC: 'RPC',
};

export const PROPOSAL_STATUS = {
	PROPOSAL_STATUS_UNSPECIFIED: 'PROPOSAL_STATUS_UNSPECIFIED',
	PROPOSAL_STATUS_DEPOSIT_PERIOD: 'PROPOSAL_STATUS_DEPOSIT_PERIOD',
	PROPOSAL_STATUS_VOTING_PERIOD: 'PROPOSAL_STATUS_VOTING_PERIOD',
	PROPOSAL_STATUS_PASSED: 'PROPOSAL_STATUS_PASSED',
	PROPOSAL_STATUS_REJECTED: 'PROPOSAL_STATUS_REJECTED',
	PROPOSAL_STATUS_FAILED: 'PROPOSAL_STATUS_FAILED',
	PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT: 'PROPOSAL_STATUS_NOT_ENOUGH_DEPOSIT',
};

export const CONST_CHAR = {
	BALANCES: 'balances',
	DELEGATION_RESPONSES: 'delegation_responses',
	REDELEGATION_RESPONSES: 'redelegation_responses',
	UNBONDING_RESPONSES: 'unbonding_responses',
	MESSAGE: 'message',
	ACTION: 'action',
	TRANSFER: 'transfer',
	SENDER: 'sender',
	RECEIVER: 'receiver',
	SPENDER: 'spender',
	CRAWL: 'crawl',
	API: 'api',
	RECIPIENT: 'recipient',
	COIN_RECEIVED: 'coin_received',
	COIN_SPENT: 'coin_spent',
	WITHDRAW_REWARDS: 'withdraw_rewards',
	AMOUNT: 'amount',
	VALIDATOR: 'validator',
	RECV_PACKET: 'recv_packet',
	PACKET_DATA: 'packet_data',
	INSTANTIATE: 'instantiate',
	_CONTRACT_ADDRESS: '_contract_address',
	CODE_ID: 'code_id',
	EXECUTE: 'execute',
};

export const MSG_TYPE = {
	MSG_SEND: '/cosmos.bank.v1beta1.MsgSend',
	MSG_MULTI_SEND: '/cosmos.bank.v1beta1.MsgMultiSend',
	MSG_VOTE: '/cosmos.gov.v1beta1.MsgVote',
	MSG_DEPOSIT: '/cosmos.gov.v1beta1.MsgDeposit',
	MSG_SUBMIT_PROPOSAL: '/cosmos.gov.v1beta1.MsgSubmitProposal',
	MSG_CREATE_VESTING_ACCOUNT: '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
	MSG_WITHDRAW_REWARDS: '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
	MSG_STORE_CODE: '/cosmwasm.wasm.v1.MsgStoreCode',
	MSG_INSTANTIATE_CONTRACT: '/cosmwasm.wasm.v1.MsgInstantiateContract',
	MSG_EXECUTE_CONTRACT: '/cosmwasm.wasm.v1.MsgExecuteContract',
	MSG_DELEGATE: '/cosmos.staking.v1beta1.MsgDelegate',
	MSG_REDELEGATE: '/cosmos.staking.v1beta1.MsgBeginRedelegate',
	MSG_UNDELEGATE: '/cosmos.staking.v1beta1.MsgUndelegate',
	MSG_IBC_TRANSFER: '/ibc.applications.transfer.v1.MsgTransfer',
	MSG_IBC_RECEIVE: '/ibc.core.channel.v1.MsgRecvPacket',
	MSG_IBC_ACKNOWLEDGEMENT: '/ibc.core.channel.v1.MsgAcknowledgement',
	MSG_IBC_CHANNEL_OPEN_ACK: '/ibc.core.channel.v1.MsgChannelOpenAck',
	MSG_IBC_CHANNEL_OPEN_INIT: '/ibc.core.channel.v1.MsgChannelOpenInit',
	MSG_IBC_CREATE_CLIENT: '/ibc.core.client.v1.MsgCreateClient',
	MSG_IBC_UPDATE_CLIENT: '/ibc.core.client.v1.MsgUpdateClient',
	MSG_IBC_CONNECTION_OPEN_ACK: '/ibc.core.connection.v1.MsgConnectionOpenAck',
	MSG_IBC_CONNECTION_OPEN_INIT: '/ibc.core.connection.v1.MsgConnectionOpenInit',
	MSG_FEEGRANT_GRANT: '/cosmos.feegrant.v1beta1.MsgGrantAllowance',
	MSG_FEEGRANT_REVOKE: '/cosmos.feegrant.v1beta1.MsgRevokeAllowance',
	MSG_EXEC: '/cosmos.authz.v1beta1.MsgExec',
};

export const LIST_NETWORK: INetworkInfo[] = require('../network.json');
export const LIST_VOTE_ANSWER: string[] = [
	'VOTE_OPTION_YES',
	'VOTE_OPTION_NO',
	'VOTE_OPTION_NO_WITH_VETO',
	'VOTE_OPTION_ABSTAIN',
];

export const EVENT_TYPE = {
	WASM: 'wasm',
	EXECUTE: 'execute',
};

export const EVENT_KEY = {
	CONTRACT_ADDRESS: '_contract_address',
};

export const COMMON_ACTION = {
	GET_CONTRACT_LIST: 'v1.asset-common.getContractListByCodeID',
};

export const CW20_ACTION = {
	URL_GET_OWNER_LIST: 'eyJhbGxfYWNjb3VudHMiOiB7fX0=',
	URL_GET_TOKEN_INFO: 'eyJ0b2tlbl9pbmZvIjoge319',
	GET_OWNER_LIST: 'v1.CW20.getOwnerList',
	GET_BALANCE: 'v1.CW20.getBalance',
	ENRICH_DATA: 'v1.CW20.enrichData',
};

export const CODEID_MANAGER_ACTION = {
	UPDATE_MANY: 'v1.codeid-manager.act-updateMany',
	FIND: 'v1.codeid-manager.act-find',
	// FIND: 'v1.codeid-manager.findByCondition',
	CHECK_STATUS: 'v1.codeid-manager.checkStatus',
	// CREATE: 'v1.codeid-manager.act-create',
	INSERT: 'v1.codeid-manager.act-insert',
};

export const VOTE_MANAGER_ACTION = {
	UPDATE_MANY: 'v1.proposal-vote-manager.act-updateMany',
	FIND: 'v1.proposal-vote-manager.act-find',
	// FIND: 'v1.vote-handler.findByCondition',
	CHECK_STATUS: 'v1.proposal-vote-manager.checkStatus',
	// CREATE: 'v1.vote-handler.act-create',
	INSERT: 'v1.proposal-vote-manager.act-insert',
	INSERT_ON_DUPLICATE_UPDATE: 'v1.proposal-vote-manager.act-insert-on-duplicate-update',
};

export const CW20_MANAGER_ACTION = {
	FIND: 'v1.CW20-asset-manager.act-find',
	COUNT: 'v1.CW20-asset-manager.act-count',
	INSERT: 'v1.CW20-asset-manager.act-insert',
	LIST: 'v1.CW20-asset-manager.act-list',
	UPSERT: 'v1.CW20-asset-manager.act-upsert',
};

export const CW721_MANAGER_ACTION = {
	FIND: 'v1.CW721-asset-manager.act-find',
	COUNT: 'v1.CW721-asset-manager.act-count',
	INSERT: 'v1.CW721-asset-manager.act-insert',
	LIST: 'v1.CW721-asset-manager.act-list',
	UPSERT: 'v1.CW721-asset-manager.act-upsert',
};

export const CW721_MEDIA_MANAGER_ACTION = {
	FIND: 'v1.CW721-asset-media-manager.act-find',
	INSERT: 'v1.CW721-asset-media-manager.act-insert',
	UPSERT: 'v1.CW721-asset-media-manager.act-upsert',
	UPDATE_MANY: 'v1.CW721-asset-media-manager.act-updateMany',
	UPDATE_MEDIA_LINK: 'v1.CW721-asset-media-manager.update-media-link',
};

export const CW721_MEDIA = {
	FIND: 'v1.CW721-media.act-find',
};

export const CW721_ACTION = {
	URL_GET_TOKEN_LIST: 'eyJhbGxfdG9rZW5zIjp7fX0=',
	GET_TOKEN_INFOR: 'v1.CW721.getTokenInfor',
	GET_TOKEN_LIST: 'v1.CW721.getTokenList',
	ENRICH_DATA: 'v1.CW721.enrichData',
};

export const CW4973_MANAGER_ACTION = {
	FIND: 'v1.cw4973-asset-manager.act-find',
	COUNT: 'v1.cw4973-asset-manager.act-count',
	INSERT: 'v1.cw4973-asset-manager.act-insert',
	LIST: 'v1.cw4973-asset-manager.act-list',
	UPSERT: 'v1.cw4973-asset-manager.act-upsert',
};

export const CW4973_MEDIA_MANAGER_ACTION = {
	FIND: 'v1.CW4973-asset-media-manager.act-find',
	INSERT: 'v1.CW4973-asset-media-manager.act-insert',
	UPSERT: 'v1.CW4973-asset-media-manager.act-upsert',
	UPDATE_MANY: 'v1.CW4973-asset-media-manager.act-updateMany',
	UPDATE_MEDIA_LINK: 'v1.CW4973-asset-media-manager.update-media-link',
};

export const CW4973_MEDIA = {
	FIND: 'v1.CW4973-media.act-find',
};

export const CW4973_ACTION = {
	URL_GET_TOKEN_LIST: 'eyJhbGxfdG9rZW5zIjp7fX0=',
	GET_TOKEN_INFOR: 'v1.CW4973.getTokenInfor',
	GET_TOKEN_LIST: 'v1.CW4973.getTokenList',
	ENRICH_DATA: 'v1.CW4973.enrichData',
};

export const CONTRACT_TYPE = {
	CW721: 'CW721',
	CW20: 'CW20',
	CW4973: 'CW4973',
};

export const ENRICH_TYPE = {
	INSERT: 'insert',
	UPSERT: 'upsert',
};

export const BOND_STATUS = {
	BOND_STATUS_UNSPECIFIED: 'BOND_STATUS_UNSPECIFIED',
	BOND_STATUS_UNBONDED: 'BOND_STATUS_UNBONDED',
	BOND_STATUS_UNBONDING: 'BOND_STATUS_UNBONDING',
	BOND_STATUS_BONDED: 'BOND_STATUS_BONDED',
};

export const MODULE_PARAM = {
	BANK: 'bank',
	GOVERNANCE: 'gov',
	DISTRIBUTION: 'distribution',
	STAKING: 'staking',
	SLASHING: 'slashing',
	IBC_TRANSFER: 'ibc-transfer',
	MINT: 'mint',
};

export const BASE_64_ENCODE = {
	RECIPIENT: 'cmVjaXBpZW50',
	SENDER: 'c2VuZGVy',
	ACTION: 'YWN0aW9u',
	BURN: 'YnVybg==',
	_CONTRACT_ADDRESS: 'X2NvbnRyYWN0X2FkZHJlc3M=',
	TOKEN_ID: 'dG9rZW5faWQ=',
	VALIDATOR: 'dmFsaWRhdG9y',
	AMOUNT: 'YW1vdW50',
	SOURCE_VALIDATOR: 'c291cmNlX3ZhbGlkYXRvcg==',
	DESTINATION_VALIDATOR: 'ZGVzdGluYXRpb25fdmFsaWRhdG9y',
};

export const SEARCH_TX_QUERY = {
	TRANSFER_SENDER: {
		type: 'transfer',
		key: 'sender',
	},
	TRANSFER_RECIPIENT: {
		type: 'transfer',
		key: 'recipient',
	},
	PROPOSAL_VOTE: {
		type: 'proposal_vote',
		key: 'proposal_id',
	},
	PROPOSAL_DEPOSIT: {
		type: 'proposal_deposit',
		key: 'proposal_id',
	},
	DELEGATE_TO_VALIDATOR: {
		type: 'delegate',
		key: 'validator',
	},
	REDELEGATE_TO_VALIDATOR: {
		type: 'redelegate',
		key: 'destination_validator',
	},
	INSTANTIATE_CONTRACT: {
		type: 'instantiate',
		key: '_contract_address',
	},
	EXECUTE_CONTRACT: {
		type: 'execute',
		key: '_contract_address',
	},
	WASM_CONTRACT_ADDRESS: {
		type: 'wasm',
		key: '_contract_address',
	},
	WASM_TOKEN_ID: {
		type: 'wasm',
		key: 'token_id',
	},
};

export enum VESTING_ACCOUNT_TYPE {
	CONTINUOUS = '/cosmos.vesting.v1beta1.ContinuousVestingAccount',
	PERIODIC = '/cosmos.vesting.v1beta1.PeriodicVestingAccount',
	DELAYED = '/cosmos.vesting.v1beta1.DelayedVestingAccount',
}

export enum FEEGRANT_STATUS {
	AVAILABLE = 'Available',
	USE_UP = 'Use up',
	REVOKED = 'Revoked',
	FAIL = 'Fail',
}

export enum FEEGRANT_ACTION {
	CREATE = 'create',
	REVOKE = 'revoke',
	USE = 'use',
	USE_UP = 'useup',
	CREATE_WITH_FEEGRANT = '_create',
	REVOKE_WITH_FEEGRANT = '_revoke',
}

export enum DELAY_JOB_TYPE {
	REDELEGATE = 'redelegate',
	UNBOND = 'unbond',
	PERIODIC_VESTING = 'periodic_vesting',
	DELAYED_VESTING = 'delayed_vesting',
}

export const PATH_COSMOS_SDK = {
	GET_LATEST_BLOCK_API: 'block?latest',
	GET_BLOCK_BY_HEIGHT_API: 'block?height=',
	GET_ALL_PROPOSAL: 'cosmos/gov/v1beta1/proposals',
	GET_PARAMS_BANK: 'cosmos/bank/v1beta1/params',
	GET_PARAMS_DISTRIBUTION: 'cosmos/distribution/v1beta1/params',
	GET_PARAMS_GOV_VOTING: 'cosmos/gov/v1beta1/params/voting',
	GET_PARAMS_GOV_TALLYING: 'cosmos/gov/v1beta1/params/tallying',
	GET_PARAMS_GOV_DEPOSIT: 'cosmos/gov/v1beta1/params/deposit',
	GET_PARAMS_SLASHING: 'cosmos/slashing/v1beta1/params',
	GET_PARAMS_STAKING: 'cosmos/staking/v1beta1/params',
	GET_PARAMS_IBC_TRANSFER: 'ibc/apps/transfer/v1/params',
	GET_PARAMS_MINT: 'cosmos/mint/v1beta1/params',
	GET_TX_API: 'cosmos/tx/v1beta1/txs/',
	GET_ALL_VALIDATOR: 'cosmos/staking/v1beta1/validators',
	GET_POOL: 'cosmos/staking/v1beta1/pool',
	GET_COMMUNITY_POOL: 'cosmos/distribution/v1beta1/community_pool',
	CODE_ID_URI: 'cosmwasm/wasm/v1/code/',
	CONTRACT_URI: 'cosmwasm/wasm/v1/contract/',
	GET_SIGNING_INFO: 'cosmos/slashing/v1beta1/signing_infos',
	GET_INFLATION: 'cosmos/mint/v1beta1/inflation',
	GET_PARAMS_DELEGATE_REWARDS: 'cosmos/distribution/v1beta1/delegators',
	GET_TX_API_EVENTS: 'cosmos/tx/v1beta1/txs',
	GET_TX_SEARCH: 'tx_search',
	GET_PARAMS_BALANCE: 'cosmos/bank/v1beta1/balances',
	GET_PARAMS_DELEGATE: 'cosmos/staking/v1beta1/delegations',
	GET_PARAMS_DELEGATOR: 'cosmos/staking/v1beta1/delegators',
	GET_PARAMS_AUTH_INFO: 'cosmos/auth/v1beta1/accounts',
	GET_PARAMS_SPENDABLE_BALANCE: 'cosmos/bank/v1beta1/spendable_balances',
	GET_PARAMS_IBC_DENOM: 'ibc/apps/transfer/v1/denom_traces',
	GET_VALIDATOR: 'cosmos/staking/v1beta1/validators/',
	GET_SUPPLY: 'cosmos/bank/v1beta1/supply',
	VERIFY_API_GET_HASH: 'api/v1/smart-contract/get-hash/',
	COSMWASM_CONTRACT_PARAM: 'cosmwasm/wasm/v1/contract/',
};

export const TOP_ACCOUNT_STATS_FIELD = {
	TXS_SENT: 'TXS_SENT',
	TXS_RECEIVED: 'TXS_RECEIVED',
	AMOUNT_SENT: 'AMOUNT_SENT',
	AMOUNT_RECEIVED: 'AMOUNT_RECEIVED',
};

export const ALLOWANCE_TYPE = {
	BASIC_ALLOWANCE: '/cosmos.feegrant.v1beta1.BasicAllowance',
	PERIODIC_ALLOWANCE: '/cosmos.feegrant.v1beta1.PeriodicAllowance',
	ALLOWED_MSGS_ALLOWANCE: '/cosmos.feegrant.v1beta1.AllowedMsgAllowance',
	ALLOWED_CONTRACT_ALLOWANCE: '/cosmos.feegrant.v1beta1.AllowedContractAllowance',
};

export const CW721_FIELD = {
	IMAGE: 'IMAGE',
	ANIMATION: 'ANIMATION',
};

export const EVMOS_TYPE_ACCOUNT = {
	ETH_ACCOUNT: '/ethermint.types.v1.EthAccount',
};

export enum MEDIA_STATUS {
	PENDING = 'PENDING',
	COMPLETED = 'COMPLETED',
	ERROR = 'ERROR',
	HANDLING = 'HANDLING',
}
