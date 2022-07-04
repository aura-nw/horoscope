export interface PageLimit {
	pageOffset: number;
	pageLimit: number;
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

export interface GetByChainIdAndPageLimitRequest extends ChainIdParams, PageLimit {}

export interface GetTxRequest extends ChainIdParams, PageLimit, BlockHeightParams, TxHashParams {}

export interface AccountInfoRequest {
    address: string;
    chainId: string;
}

export interface CrawlAccountInfoParams {
	listAddresses: string[];
	chainId: string;
}