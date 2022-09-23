export interface CountVoteParams {
	chain_id: string;
	proposal_id: number;
}

export interface CountVoteResponse {
	answer: string;
	count: number;
}
