import { ITransaction } from '../entities';

export interface ListTxInBlockParams {
	listTx: string[];
}
export interface ListTxCreatedParams {
	listTx: ITransaction[];
	source: string;
	chainId: string;
}
