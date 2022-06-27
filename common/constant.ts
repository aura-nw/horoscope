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
}

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
}
