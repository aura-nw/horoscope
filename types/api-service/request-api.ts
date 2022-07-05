export interface PageLimit {
	pageOffset: number;
	pageLimit: number;
	countTotal?: boolean;
	nextKey?: string;
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
		BlockHeightParams {}

export interface GetTxRequest extends ChainIdParams, PageLimit, BlockHeightParams, TxHashParams {}

export interface AccountInfoRequest {
	address: string;
	chainId: string;
}

export interface CrawlAccountInfoParams {
	listAddresses: string[];
	chainId: string;
}

export interface GetProposalRequest extends ChainIdParams, PageLimit {}

export interface GetValidatorRequest extends ChainIdParams, PageLimit {}
