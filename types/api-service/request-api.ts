/* eslint-disable @typescript-eslint/ban-types */
import { DELAY_JOB_TYPE } from 'common/constant';

export interface PageLimit {
	pageOffset: number;
	pageLimit: number;
	countTotal?: boolean;
	nextKey?: string;
	reverse?: boolean;
}

export interface ChainIdParams {
	chainid: string;
}

export interface BlockHeightParams {
	blockHeight: number;
}

export interface TxHashParams {
	txHash: string;
}

export interface BlockHashParams {
	blockHash: string;
}

export interface GetBlockRequest
	extends ChainIdParams,
		PageLimit,
		BlockHashParams,
		BlockHeightParams {
	operatorAddress: string;
	consensusHexAddress: string;
}
export interface GetVoteRequest extends ChainIdParams, PageLimit {
	answer: string;
	proposalid: number;
}

export interface GetAssetByAddressRequest extends ChainIdParams, PageLimit {
	address: string;
}
export interface GetAllAsset extends ChainIdParams, PageLimit {}

export interface GetAssetByOwnerAddressRequest extends ChainIdParams, PageLimit {
	owner: string;
	tokenId: string;
	tokenName: string;
	contractAddress: string;
	contractType: string;
	isBurned: boolean;
}

export interface GetAssetByContractTypeAddressRequest extends ChainIdParams, PageLimit {
	contractType: any;
	owner: string;
}

export interface AddressParams {
	address: string;
}

export interface GetTxRequest
	extends ChainIdParams,
		PageLimit,
		BlockHeightParams,
		TxHashParams,
		AddressParams {
	searchType: string;
	searchKey: string;
	searchValue: string;
	query: string;
	queryAnd: string[];
	addressInContract: string;
	sequenceIBC: string;
	fromHeight: number;
	needFullLog: boolean;
}
export interface GetPowerEventTxRequest extends ChainIdParams, PageLimit, AddressParams {}

export interface GetIBCTxRequest extends PageLimit {
	sequenceIBC: string;
	chainid1: string;
	chainid2: string;
}
export interface AccountInfoRequest {
	address: string;
	chainId: string;
}

export interface CrawlAccountInfoParams {
	listAddresses: string[];
	chainId: string;
}

export interface GetAccountStakeParams {
	address: string;
	chainId: string;
	type: string;
	limit: number;
	offset: number;
}

export interface GetProposalRequest extends ChainIdParams, PageLimit {
	proposalId: string;
}

export interface GetValidatorRequest extends ChainIdParams, PageLimit {
	operatorAddress: string;
	status: string;
}

export interface GetAccountUnbondRequest extends ChainIdParams, PageLimit {
	address: string;
}
export interface GetParamRequest extends ChainIdParams, PageLimit {
	module: string;
}

export interface GetHolderRequest extends ChainIdParams, PageLimit {
	contractAddress: string;
	contractType: string;
}

export interface AddBurnedToAsset extends ChainIdParams {
	contractAddress: string;
	tokenId: string;
}

export interface GetTotalRewardsByAddress extends ChainIdParams {
	operatorAddress: string;
	delegatorAddress: string;
}

export interface QueryIBCDenomParams {
	hash: string;
	denom: string;
}
export interface GetFeegrantRequest extends ChainIdParams, PageLimit {
	granter: string;
	grantee: string;
	status: string;
	expired: boolean;
	txhash: string;
}
export interface GetFeegrantInactiveRequest extends ChainIdParams, PageLimit {
	granter: string;
	grantee: string;
	txhash: string;
}
export interface QueryDelayJobParams {
	address: string;
	type: DELAY_JOB_TYPE | DELAY_JOB_TYPE[];
	chain_id: string;
}

export interface QueryPendingDelayJobParams {
	chain_id: string;
}

export interface QueryTransactionStatsParams {
	query: Object;
	sort: string;
	limit: number;
}

export interface BlockchainDataRequest {
	chainId: string;
	limit: number;
	timezone: number;
}

export interface TopAccountsRequest {
	chainId: string;
	field: string;
	dayRange: number;
	limit: number;
}

export interface GetContractsRequest {
	chainId: string;
	height: number;
	contract_addresses: string[];
	limit: number;
	nextKey: string;
}
