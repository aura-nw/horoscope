import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { ObjectIdNull } from 'types';
import { Types } from 'mongoose';
import { NumericConverter } from './converters/numeric.converter';
import { DateConverter } from './converters/date.converter';

export interface IBlockIdPart {
	total: Number;
	hash: String;
}
export interface IBlockId {
	hash: String;
	parts: IBlockIdPart | null;
}
export interface IBlockHeaderVersion {
	block: String;
}
export interface IBlockHeader {
	version: IBlockHeaderVersion | null;
	chain_id: String;
	height: Number;
	time: Date | null;
	last_block_id: IBlockId | null;
	last_commit_hash: String;
	data_hash: String;
	validators_hash: String;
	next_validators_hash: String;
	consensus_hash: String;
	app_hash: String;
	last_results_hash: String;
	evidence_hash: String;
	proposer_address: String;
}

export interface IData {
	txs: String[];
}
export interface IEvidenceDetail {
	evidence: Object[];
}
export interface IEvidence {
	evidence: IEvidenceDetail;
}

export interface ISignature {
	block_id_flag: Number;
	validator_address: String;
	timestamp: String;
	signature: String | null;
}
export interface ILastCommit {
	height: Number;
	round: Number;
	block_id: IBlockId | null;
	signatures: ISignature[];
}
export interface IBlockDetail {
	header: IBlockHeader | null;
	data: IData | null;
	evidence: IEvidence | null;
	last_commit: ILastCommit | null;
}

export interface IBlock {
	_id: ObjectIdNull;
	block_id: IBlockId | null;
	block: IBlockDetail | null;
}

@JsonObject('BlockIdPart')
export class BlockIdPart implements IBlockIdPart {
	@JsonProperty('total', Number)
	total: Number = 0;
	@JsonProperty('hash', String)
	hash: String = '';
}

@JsonObject('BlockId')
export class BlockId implements IBlockId {
	@JsonProperty('hash', String)
	hash: String = '';
	@JsonProperty('parts', BlockIdPart)
	parts: BlockIdPart | null = null;
}

@JsonObject('BlockHeaderVersion')
export class BlockHeaderVersion implements IBlockHeaderVersion {
	@JsonProperty('block', String)
	block: String = '';
}

@JsonObject('BlockHeader')
export class BlockHeader implements IBlockHeader {
	@JsonProperty('version', BlockHeaderVersion)
	version: BlockHeaderVersion | null = null;
	@JsonProperty('chain_id', String)
	chain_id: String = '';
	@JsonProperty('height', NumericConverter)
	height: Number = 0;
	@JsonProperty('time', DateConverter)
	time: Date | null = null;
	@JsonProperty('last_block_id', BlockId)
	last_block_id: BlockId | null = null;
	@JsonProperty('last_commit_hash', String)
	last_commit_hash: String = '';
	@JsonProperty('data_hash', String)
	data_hash: String = '';
	@JsonProperty('validators_hash', String)
	validators_hash: String = '';
	@JsonProperty('next_validators_hash', String)
	next_validators_hash: String = '';
	@JsonProperty('consensus_hash', String)
	consensus_hash: String = '';
	@JsonProperty('app_hash', String)
	app_hash: String = '';
	@JsonProperty('last_results_hash', String)
	last_results_hash: String = '';
	@JsonProperty('evidence_hash', String)
	evidence_hash: String = '';
	@JsonProperty('proposer_address', String)
	proposer_address: String = '';
}

@JsonObject('BlockData')
export class BlockData implements IData {
	@JsonProperty('txs', [String])
	txs: String[] = [];
}
@JsonObject('BlockDataEvidence')
export class BlockDataEvidence implements IEvidenceDetail {
	@JsonProperty('evidence', [Object])
	evidence: Object[] = [];
}
@JsonObject('Signatures')
export class Signature implements ISignature {
	@JsonProperty('block_id_flag', Number)
	block_id_flag: number = 0;
	@JsonProperty('validator_address', String)
	validator_address: String = '';
	@JsonProperty('timestamp', String)
	timestamp: String = '';
	@JsonProperty('signature', String, true)
	signature: String | null = null;
}

@JsonObject('BlockLastCommit')
export class BlockLastCommit implements ILastCommit {
	@JsonProperty('height', NumericConverter)
	height: Number = 0;
	@JsonProperty('round', Number)
	round: number = 0;
	@JsonProperty('block_id', BlockId)
	block_id: BlockId | null = null;
	@JsonProperty('signatures', [Signature])
	signatures: Signature[] = [];
}

@JsonObject('BlockDetail')
export class BlockDetail implements IBlockDetail {
	@JsonProperty('header', BlockHeader)
	header: BlockHeader | null = null;
	@JsonProperty('data', BlockData)
	data: BlockData | null = null;
	@JsonProperty('evidence', BlockDataEvidence)
	evidence: IEvidence | null = null;
	@JsonProperty('last_commit', BlockLastCommit)
	last_commit: BlockLastCommit | null = null;
}

@JsonObject('Block')
export class BlockEntity implements IBlock {
	@JsonProperty('_id', String, true)
	_id = Config.DB_BLOCK.dialect === 'local' ? Types.ObjectId() : null;
	@JsonProperty('block_id', BlockId)
	block_id: BlockId | null = null;
	@JsonProperty('block', BlockDetail)
	block: BlockDetail | null = null;

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public getMongoEntity() {
		// eslint-disable-next-line no-underscore-dangle
		return { ...this, _id: this._id && (this._id as Types.ObjectId).toString() };
	}
}
