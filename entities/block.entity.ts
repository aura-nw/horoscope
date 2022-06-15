import { Config } from '../common';
import { JsonObject, JsonProperty } from 'json2typescript';
import { ObjectIdNull } from 'types';
import { Types } from 'mongoose';

@JsonObject('BlockIdPart')
export class BlockIdPart {
	@JsonProperty('total', Number)
	total: number = 0;
	@JsonProperty('hash', String)
	hash: String = '';
}

@JsonObject('BlockId')
export class BlockId {
	@JsonProperty('hash', String)
	hash: String = '';
	@JsonProperty('parts', BlockIdPart)
	parts: BlockIdPart | null = null;
}

@JsonObject('BlockHeaderVersion')
export class BlockHeaderVersion {
	@JsonProperty('block', String)
	block: String = '';
}

@JsonObject('BlockHeader')
export class BlockHeader {
	@JsonProperty('version', BlockHeaderVersion)
	version: BlockHeaderVersion | null = null;
	@JsonProperty('chain_id', String)
	chain_id: String = '';
	@JsonProperty('height', String)
	height: String = '';
	@JsonProperty('time', String)
	time: String = '';
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
export class BlockData {
	@JsonProperty('txs', [String])
	txs: String[] = [];
}
@JsonObject('BlockDataEvidence')
export class BlockDataEvidence {
	@JsonProperty('evidence', [String])
	evidence: String[] = [];
}
@JsonObject('Signatures')
export class Signature {
	@JsonProperty('block_id_flag', Number)
	block_id_flag: number = 0;
	@JsonProperty('validator_address', String)
	validator_address: String = '';
	@JsonProperty('timestamp', String)
	timestamp: String = '';
	@JsonProperty('signature', String)
	signature: String = '';
}

@JsonObject('BlockLastCommit')
export class BlockLastCommit {
	@JsonProperty('height', String)
	height: String = '';
	@JsonProperty('round', Number)
	round: number = 0;
	@JsonProperty('block_id', BlockId)
	block_id: BlockId | null = null;
	@JsonProperty('signatures', [Signature])
	signatures: Signature[] = [];
}

@JsonObject('BlockDetail')
export class BlockDetail {
	@JsonProperty('header', BlockHeader)
	header: BlockHeader | null = null;
	@JsonProperty('data', BlockData)
	data: BlockData | null = null;
	@JsonProperty('evidence', BlockDataEvidence)
	evidence: BlockDataEvidence | null = null;
	@JsonProperty('last_commit', BlockLastCommit)
	last_commit: BlockLastCommit | null = null;
}

@JsonObject('Block')
export class BlockEntity {
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
