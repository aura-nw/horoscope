import { NetworkInfo } from 'types';

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

export const LIST_NETWORK: NetworkInfo[] = require('../network.json');

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
	UPDATE_MANY: 'v1.codeid-manager.updateMany',
	FIND: 'v1.codeid-manager.find',
	CHECK_STATUS: 'v1.codeid-manager.checkStatus',
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
