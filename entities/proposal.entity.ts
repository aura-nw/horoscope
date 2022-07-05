import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Coin } from './coin.entity';
import { NumericConverter } from './converters/numeric.converter';
import { DateConverter } from './converters/date.converter';

export interface IProposal {
	_id: Types.ObjectId | string | null;
	proposal_id: Number | null;
	content: Content;
	status: String;
	final_tally_result: Final_tally_result;
	submit_time: Date | null;
	deposit_end_time: Date | null;
	total_deposit: Deposit[];
	voting_start_time: Date | null;
	voting_end_time: Date | null;
}

@JsonObject('Changes')
export class Changes {
	@JsonProperty('subspace', String)
	subspace: String = '';
	@JsonProperty('key', String)
	key: String = '';
	@JsonProperty('value', String)
	value: String = '';
}

@JsonObject('Final_tally_result')
export class Final_tally_result {
	@JsonProperty('yes', String)
	yes: String = '';
	@JsonProperty('no', String)
	no: String = '';
	@JsonProperty('abstain', String)
	abstain: String = '';
	@JsonProperty('no_with_veto', String)
	no_with_veto: String = '';
}

@JsonObject('Deposit')
export class Deposit {
	@JsonProperty('denom', String)
	denom: String = '';
	@JsonProperty('amount', String)
	amount: String = '';
}

@JsonObject('content')
export class Content {
	@JsonProperty('@type', String)
	type: String = '';
	@JsonProperty('title', String)
	title: String = '';
	@JsonProperty('description', String)
	description: String = '';
	@JsonProperty('changes', [Changes], true)
	changes: Changes[] = [];
	@JsonProperty('recipient', String, true)
	recipient: String = '';
	@JsonProperty('amount', [Coin], true)
	amount: Coin[] = [];
}

@JsonObject('Proposal')
export class ProposalEntity implements IProposal {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PROPOSAL.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('proposal_id', NumericConverter)
	proposal_id = null;
	@JsonProperty('content', Content)
	content = {} as Content;
	@JsonProperty('status', String)
	status: String = '';
	@JsonProperty('final_tally_result', Final_tally_result)
	final_tally_result: Final_tally_result = {} as Final_tally_result;
	@JsonProperty('submit_time', DateConverter)
	submit_time = null;
	@JsonProperty('deposit_end_time', DateConverter)
	deposit_end_time = null;
	@JsonProperty('total_deposit', [Deposit])
	total_deposit: Deposit[] = [];
	@JsonProperty('voting_start_time', DateConverter)
	voting_start_time = null;
	@JsonProperty('voting_end_time', DateConverter)
	voting_end_time = null;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
