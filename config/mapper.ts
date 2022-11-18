import { ObjectID } from 'bson';
import { ProposalEntity } from 'entities';
import { AutoMapperUtil } from '../utils/auto-mapper';
import { ProposalSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/gov';
export const MAPPER_CONFIG = {
	PROPOSAL_MAPPING: AutoMapperUtil.createMap()
		.mapProperties((t: ProposalEntity) => [
			t.content,
			t.deposit_end_time,
			t.final_tally_result,
			t.proposal_id,
			t.submit_time,
			t.deposit_end_time,
			t.status,
			t.total_deposit,
			t.voting_start_time,
			t.voting_end_time,
		])
		.fromProperties((f: ProposalSDKType) => [
			f.content,
			f.deposit_end_time,
			f.final_tally_result,
			f.proposal_id,
			f.submit_time,
			f.deposit_end_time,
			f.status,
			f.total_deposit,
			f.voting_start_time,
			f.voting_end_time,
		]),
};
