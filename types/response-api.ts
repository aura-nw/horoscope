import { ProposalEntity } from 'entities';

export type PagingationResponseFromApi = {
	next_key: string | null;
	total: string;
};

export type ProposalResponseFromApi = {
	proposals: ProposalEntity[];
	pagination: PagingationResponseFromApi;
};
