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
	CRAWL: 'crawl',
	API: 'api',
	RECIPIENT: 'recipient',
	COIN_RECEIVED: 'coin_received',
	WITHDRAW_REWARDS: 'withdraw_rewards',
	AMOUNT: 'amount',
	VALIDATOR: 'validator',
};

export const MSG_TYPE = {
	MSG_SEND: '/cosmos.bank.v1beta1.MsgSend',
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
};

export const CW20_MANAGER_ACTION = {
	FIND: 'v1.cw20-asset-manager.act-find',
	COUNT: 'v1.cw20-asset-manager.act-count',
	INSERT: 'v1.cw20-asset-manager.act-insert',
	LIST: 'v1.cw20-asset-manager.act-list',
	UPSERT: 'v1.cw20-asset-manager.act-upsert',
};

export const CW721_MANAGER_ACTION = {
	FIND: 'v1.cw721-asset-manager.act-find',
	COUNT: 'v1.cw721-asset-manager.act-count',
	INSERT: 'v1.cw721-asset-manager.act-insert',
	LIST: 'v1.cw721-asset-manager.act-list',
	UPSERT: 'v1.cw721-asset-manager.act-upsert',
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

export const CONTRACT_TYPE = {
	CW721: 'CW721',
	CW20: 'CW20',
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
	CONTINUOUS = 'cosmos-sdk/ContinuousVestingAccount',
	PERIODIC = 'cosmos-sdk/PeriodicVestingAccount',
	DELAYED = 'cosmos-sdk/DelayedVestingAccount',
}

export enum DELAY_JOB_TYPE {
	REDELEGATE = 'redelegate',
	UNBOND = 'unbond',
	PERIODIC_VESTING = 'periodic_vesting',
	DELAYED_VESTING = 'delayed_vesting',
}

export enum DELAY_JOB_STATUS {
	PENDING = 'pending',
	DONE = 'done',
}
