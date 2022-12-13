import { Coin } from 'entities/coin.entity';
import { ISigningInfo } from 'model/signing-info.model';
import {
	IBlock,
	ICommunityPool,
	IDelegationResponse,
	IDeposit,
	IPool,
	IProposal,
	IValidator,
} from '../entities';

export interface IPagingationResponseFromLCD {
	next_key: string | null;
	total: string;
}

export interface IProposalResponseFromLCD {
	proposals: IProposal[];
	pagination: IPagingationResponseFromLCD;
}
export interface IDepositProposalResponseFromLCD {
	deposits: IDeposit[];
	pagination: IPagingationResponseFromLCD;
}
export interface IValidatorResponseFromLCD {
	validators: IValidator[];
	pagination: IPagingationResponseFromLCD;
}

export interface IPoolResponseFromLCD {
	pool: IPool;
}

export interface ICommunityPoolResponseFromLCD {
	pool: ICommunityPool[];
}
export interface ISigningInfoResponseFromLCD {
	info: ISigningInfo[];
}
export interface ISigningInfoEntityResponseFromLCD {
	val_signing_info: ISigningInfo;
}
export interface IMintInflationResponseFromLCD {
	inflation: string;
}

export interface IDelegationResponseFromLCD {
	delegation_response: IDelegationResponse;
	pagination: IPagingationResponseFromLCD;
}

export interface ResponseFromRPC {
	jsonrpc: string;
	id: string;
	result: any;
}

export interface BlockResponseFromLCD {
	blocks: IBlock[];
}

export interface ISupplyResponseFromLCD {
	supply: Coin[];
	pagination: IPagingationResponseFromLCD;
}

export interface ResponseDto {
	code: number | string;
	message: string;
	data: any;
}
