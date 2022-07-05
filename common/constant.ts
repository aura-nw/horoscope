import { Config } from 'common';

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

export const LIST_NETWORK = [
	{
		chainName: 'Aura devnet',
		chainId: 'aura-devnet',
		RPC: ['https://rpc.dev.aura.network'],
		LCD: ['https://lcd.dev.aura.network'],
	},
	{
		chainName: 'Aura Serenity',
		chainId: 'serenity-testnet-001',
		RPC: ['https://rpc.serenity.aura.network'],
		LCD: ['https://lcd.serenity.aura.network'],
	},
	{
		chainName: 'Aura Halo',
		chainId: 'halo-testnet-001',
		RPC: ['https://rpc.halo.aura.network'],
		LCD: ['https://lcd.halo.aura.network'],
	},
	{
		chainName: 'Theta Testnet',
		chainId: 'theta-testnet-001',
		RPC: ['https://rpc.sentry-01.theta-testnet.polypore.xyz'],
		LCD: ['https://rest.sentry-01.theta-testnet.polypore.xyz'],
	},
	{
		chainName: 'Osmosis Testnet',
		chainId: 'osmo-test-4',
		RPC: ['https://testnet-rpc.osmosis.zone/'],
		LCD: ['https://osmosistest-lcd.quickapi.com'],
	},
	{
		chainName: 'Osmosis Mainnet',
		chainId: 'osmosis-1',
		RPC: ['https://rpc.osmosis.zone'],
		LCD: ['https://lcd.osmosis.zone'],
	},
];

export const EVENT_TYPE = {
	WASM: 'wasm',
	EXECUTE: 'execute',
}


export const EVENT_KEY = {
	CONTRACT_ADDRESS: '_contract_address',
}

export const ASSET_INDEXER_ACTION = {
	GET_TOKEN_LIST: 'eyJhbGxfdG9rZW5zIjp7fX0=',
	ACTION_GET_TOKEN_INFOR: 'v1.assetHandleCodeID.getTokenInfor',
	ACTION_GET_TOKEN_LIST: 'v1.assetHandleCodeID.getTokenList',
	ASSET_MANAGER_UPSERT: 'asset-manager.upsert',
	CODEID_UPDATEMANY: 'code_id.updateMany',
}
