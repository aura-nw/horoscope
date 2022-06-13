import { Coin } from './coin.entity';
import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('SendEnabled')
export class SendEnabled {
	@JsonProperty('denom', Boolean)
	denom: Boolean = true;
	@JsonProperty('enabled', Boolean)
	enabled: Boolean = true;
}
@JsonObject('BankParam')
export class BankParam {
	@JsonProperty('send_enabled', [SendEnabled])
	sendEnabled: SendEnabled[] = [];
	@JsonProperty('default_send_enabled', Boolean)
	defaultSendEnabled: Boolean = true;
}

@JsonObject('GovVotingParam')
export class GovVotingParam {
	@JsonProperty('voting_period', String)
	votingPeriod: String = '';
}
@JsonObject('GovDepositParam')
export class GovDepositParam {
	@JsonProperty('min_deposit', [Coin])
	votingPeriod: Coin[] = [];
	@JsonProperty('max_deposit_period', String)
	maxDepositPeriod: String = '';
}
@JsonObject('GovTallyParam')
export class GovTallyParam {
	@JsonProperty('quorum', String)
	quorum: String = '';
	@JsonProperty('threshold', String)
	threshold: String = '';
	@JsonProperty('veto_threshold', String)
	vetoThreshold: String = '';
}

@JsonObject('GovParam')
export class GovParam {
	@JsonProperty('voting_params', GovVotingParam)
	votingParams: GovVotingParam = new GovVotingParam();
	@JsonProperty('deposit_params', GovDepositParam)
	depositParams: GovDepositParam = new GovDepositParam();
	@JsonProperty('tally_params', GovTallyParam)
	tallyParams: GovTallyParam = new GovTallyParam();
}

@JsonObject('DistributionParam')
export class DistributionParam {
	@JsonProperty('community_tax', String)
	communityTax: String = '';
	@JsonProperty('base_proposer_reward', String)
	baseProposerReward: String = '';
	@JsonProperty('bonus_proposer_reward', String)
	bonusProposerReward: String = '';
	@JsonProperty('withdraw_addr_enabled', Boolean)
	defaultSendEnabled: Boolean = true;
}

@JsonObject('SlashingParam')
export class SlashingParam {
	@JsonProperty('signed_blocks_window', String)
	signedBlocksWindow: String = '';
	@JsonProperty('min_signed_per_window', String)
	mintSignedPerWindow: String = '';
	@JsonProperty('downtime_jail_duration', String)
	downtimeJailDuration: String = '';
	@JsonProperty('slash_fraction_double_sign', String)
	slashFractionDoubleSign: String = '';
	@JsonProperty('slash_fraction_downtime', String)
	slashFractionDowntime: String = '';
}

@JsonObject('StakingParam')
export class StakingParam {
	@JsonProperty('unbonding_time', String)
	unbondingTime: String = '';
	@JsonProperty('max_validators', Number)
	maxValidators: Number = 0;
	@JsonProperty('max_entries', Number)
	maxEntries: Number = 0;
	@JsonProperty('historical_entries', Number)
	historicalEntries: Number = 0;
	@JsonProperty('bond_denom', String)
	bondDenom: String = '';
}

@JsonObject('IbcTransferParam')
export class IbcTransferParam {
	@JsonProperty('send_enabled', Boolean)
	sendEnabled: Boolean = true;
	@JsonProperty('receive_enabled', Boolean)
	receiveEnabled: Boolean = true;
}
