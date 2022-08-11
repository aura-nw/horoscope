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

export interface GetAssetByAddressRequest extends ChainIdParams, PageLimit {
	address: string;
}
export interface GetAllAsset extends ChainIdParams, PageLimit {}

export interface GetAssetByOwnerAddressRequest extends ChainIdParams, PageLimit {
	owner: string;
	tokenId: String;
	tokenName: String;
	contractAddress: String;
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
}

export interface AccountInfoRequest {
	address: string;
	chainId: string;
}

export interface CrawlAccountInfoParams {
	listAddresses: string[];
	chainId: string;
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
