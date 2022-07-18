import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Types } from 'mongoose';
import { Coin, ICoin } from './coin.entity';
import { NumericConverter } from './converters/numeric.converter';
import { DateConverter } from './converters/date.converter';

export interface IProposal {
	_id: Types.ObjectId | string | null;
	proposal_id: Number | null;
	content: Content;
	status: String;
	tally: IFinal_tally_result;
	final_tally_result: IFinal_tally_result;
	submit_time: Date | null;
	deposit_end_time: Date | null;
	deposit: IDeposit;
	total_deposit: ICoin[];
	voting_start_time: Date | null;
	voting_end_time: Date | null;
}

export interface IDeposit {
	depositor: String;
	amount: ICoin[];
}

export interface IChanges {
	subspace: String;
	key: String;
	value: String;
}

export interface IFinal_tally_result {
	yes: String;
	no: String;
	abstain: String;
	no_with_veto: String;
}
@JsonObject('Changes')
export class Changes implements IChanges {
	@JsonProperty('subspace', String)
	subspace: String = '';
	@JsonProperty('key', String)
	key: String = '';
	@JsonProperty('value', String)
	value: String = '';
}

@JsonObject('Final_tally_result')
export class Final_tally_result implements IFinal_tally_result {
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
export class Deposit implements IDeposit {
	@JsonProperty('depositor', String)
	depositor: String = '';
	@JsonProperty('amount', [Coin])
	amount: Coin[] = [];
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
	@JsonProperty('total_deposit', [Coin])
	total_deposit: Coin[] = [];
	@JsonProperty('voting_start_time', DateConverter)
	voting_start_time = null;
	@JsonProperty('voting_end_time', DateConverter)
	voting_end_time = null;

	tally: IFinal_tally_result = {} as IFinal_tally_result;
	deposit: IDeposit = {} as IDeposit;
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
