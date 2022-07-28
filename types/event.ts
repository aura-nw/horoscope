import { ITransaction } from '../entities';

export interface ListTxInBlockParams {
	listTx: string[];
}
export interface ListTxCreatedParams {
	listTx: ITransaction[];
	source: string;
	chainId: string;
}

export interface ListValidatorAddress {
	listAddress: string[];
}
export interface TransactionHashParam {
	txHash: string;
}
