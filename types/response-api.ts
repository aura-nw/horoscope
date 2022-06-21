import { CommunityPoolEntity, PoolEntity, ProposalEntity, ValidatorEntity } from 'entities';

export type PagingationResponseFromApi = {
	next_key: string | null;
	total: string;
};

export type ProposalResponseFromApi = {
	proposals: ProposalEntity[];
	pagination: PagingationResponseFromApi;
};

export type ValidatorResponseFromApi = {
	validators: ValidatorEntity[];
	pagination: PagingationResponseFromApi;
};

export type PoolResponseFromApi = {
	pool: PoolEntity;
};

export type CommunityPoolResponseFromApi = {
	pool: CommunityPoolEntity;
};
