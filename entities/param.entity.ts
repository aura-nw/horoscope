import { Coin, ICoin } from './coin.entity';
import { JsonObject, JsonProperty } from 'json2typescript';
import { Config } from '../common';
import { Types } from 'mongoose';

export interface IParam {
	module: String;
	params:
		| IBankParam
		| IGovParam
		| IDistributionParam
		| ISlashingParam
		| IStakingParam
		| IIbcTransferParam
		| IMintParam
		| null;
}

export interface ISendEnabled {
	denom: String;
	enabled: Boolean;
}

export interface IBankParam {
	send_enabled: ISendEnabled[];
	default_send_enabled: Boolean;
}

export interface IGovVotingParam {
	votingPeriod: String;
}

export interface IGovDepositParam {
	min_deposit: ICoin[];
	max_deposit_period: String;
}
export interface IGovTallyParam {
	quorum: String;
	threshold: String;
	vetoThreshold: String;
}

export interface IGovParam {
	voting_param: IGovVotingParam;
	deposit_param: IGovDepositParam;
	tally_param: IGovTallyParam;
}

export interface IDistributionParam {
	community_tax: String;
	base_proposer_reward: String;
	bonus_proposer_reward: String;
	withdraw_addr_enabled: String;
}

export interface ISlashingParam {
	signed_blocks_window: String;
	min_signed_per_window: String;
	downtime_jail_duration: String;
	slash_fraction_double_sign: String;
	slash_fraction_downtime: String;
}

export interface IStakingParam {
	unbonding_time: String;
	max_validators: Number;
	max_entries: Number;
	historical_entries: Number;
	bond_denom: String;
}

export interface IIbcTransferParam {
	send_enabled: Boolean;
	receive_enabled: Boolean;
}

export interface IMintParam {
	mint_denom: String;
	inflation_rate_change: String;
	inflation_max: String;
	inflation_min: String;
	goal_bonded: String;
	blocks_per_year: String;
}
@JsonObject('SendEnabled')
export class SendEnabled implements ISendEnabled {
	@JsonProperty('denom', Boolean)
	denom: String = '';
	@JsonProperty('enabled', Boolean)
	enabled: Boolean = true;
}
@JsonObject('BankParam')
export class BankParam implements IBankParam {
	@JsonProperty('send_enabled', [SendEnabled])
	send_enabled: SendEnabled[] = [];
	@JsonProperty('default_send_enabled', Boolean)
	default_send_enabled: Boolean = true;
}

@JsonObject('GovVotingParam')
export class GovVotingParam implements IGovVotingParam {
	@JsonProperty('voting_period', String)
	votingPeriod: String = '';
}
@JsonObject('GovDepositParam')
export class GovDepositParam implements IGovDepositParam {
	@JsonProperty('min_deposit', [Coin])
	min_deposit: Coin[] = [];
	@JsonProperty('max_deposit_period', String)
	max_deposit_period: String = '';
}
@JsonObject('GovTallyParam')
export class GovTallyParam implements IGovTallyParam {
	@JsonProperty('quorum', String)
	quorum: String = '';
	@JsonProperty('threshold', String)
	threshold: String = '';
	@JsonProperty('veto_threshold', String)
	vetoThreshold: String = '';
}

@JsonObject('GovParam')
export class GovParam implements IGovParam {
	@JsonProperty('voting_params', GovVotingParam)
	voting_param: GovVotingParam = new GovVotingParam();
	@JsonProperty('deposit_params', GovDepositParam)
	deposit_param: GovDepositParam = new GovDepositParam();
	@JsonProperty('tally_params', GovTallyParam)
	tally_param: GovTallyParam = new GovTallyParam();
}

@JsonObject('DistributionParam')
export class DistributionParam implements IDistributionParam {
	@JsonProperty('community_tax', String)
	community_tax: String = '';
	@JsonProperty('base_proposer_reward', String)
	base_proposer_reward: String = '';
	@JsonProperty('bonus_proposer_reward', String)
	bonus_proposer_reward: String = '';
	@JsonProperty('withdraw_addr_enabled', Boolean)
	withdraw_addr_enabled: String = '';
}

@JsonObject('SlashingParam')
export class SlashingParam implements ISlashingParam {
	@JsonProperty('signed_blocks_window', String)
	signed_blocks_window: String = '';
	@JsonProperty('min_signed_per_window', String)
	min_signed_per_window: String = '';
	@JsonProperty('downtime_jail_duration', String)
	downtime_jail_duration: String = '';
	@JsonProperty('slash_fraction_double_sign', String)
	slash_fraction_double_sign: String = '';
	@JsonProperty('slash_fraction_downtime', String)
	slash_fraction_downtime: String = '';
}

@JsonObject('StakingParam')
export class StakingParam implements IStakingParam {
	@JsonProperty('unbonding_time', String)
	unbonding_time: String = '';
	@JsonProperty('max_validators', Number)
	max_validators: Number = 0;
	@JsonProperty('max_entries', Number)
	max_entries: Number = 0;
	@JsonProperty('historical_entries', Number)
	historical_entries: Number = 0;
	@JsonProperty('bond_denom', String)
	bond_denom: String = '';
}

@JsonObject('IbcTransferParam')
export class IbcTransferParam implements IIbcTransferParam {
	@JsonProperty('send_enabled', Boolean)
	send_enabled: Boolean = true;
	@JsonProperty('receive_enabled', Boolean)
	receive_enabled: Boolean = true;
}

@JsonObject('MintParam')
export class MintParam implements IMintParam {
	@JsonProperty('mint_denom', String)
	mint_denom: String = '';
	@JsonProperty('inflation_rate_change', String)
	inflation_rate_change: String = '';
	@JsonProperty('inflation_max', String)
	inflation_max: String = '';
	@JsonProperty('inflation_min', String)
	inflation_min: String = '';
	@JsonProperty('goal_bonded', String)
	goal_bonded: String = '';
	@JsonProperty('blocks_per_year', String)
	blocks_per_year: String = '';
}

@JsonObject('Param')
export class ParamEntity implements IParam {
	@JsonProperty('_id', String, true)
	_id = Config.DB_PARAM.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('module', String)
	module: String = '';
	@JsonProperty(
		'params',
		BankParam ||
			GovParam ||
			DistributionParam ||
			SlashingParam ||
			StakingParam ||
			IbcTransferParam ||
			MintParam,
	)
	params:
		| BankParam
		| GovParam
		| DistributionParam
		| SlashingParam
		| StakingParam
		| IbcTransferParam
		| MintParam
		| null = null;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
