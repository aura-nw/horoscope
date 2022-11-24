import { Config } from '../../common';
import { Kind } from 'graphql';
import { gql } from 'moleculer-apollo-server';
import {
	CHAIN_ID_DEV,
	CHAIN_ID_PROD,
	ENV_NAMESPACE,
	prismaAuraTestnet,
	prismaCosmoshubProd,
	prismaEuphoriaProd,
	prismaEuphoriaTestnet,
	prismaEvmosTestnet,
	prismaOsmosisProd,
	prismaSerenityTestnet,
	prismaThetaTestnet
} from '../../utils/context';
const { GraphQLScalarType } = require('graphql');
const GraphQLJSON = require('graphql-type-json');

export const TypeDefs = gql`
	type Query {
		accountInfo(
			address: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [AccountInfo]
		accountStatistics(
			address: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [AccountStatistics]
		block(hash: String, chain_id: String, skip: Int, take: Int): [Block]
		codeId(
			code_id: String
			contract_type: String
			status: String
			chain_id: String
			skip: Int
			take: Int
		): [CodeId]
		communityPool(chain_id: String): [CommunityPool]
		cw20Asset(
			code_id: String
			contract_address: String
			owner: String
			chain_id: String
			skip: Int
			take: Int
		): [CW20Asset]
		cw721Asset(
			code_id: String
			contract_address: String
			owner: String
			chain_id: String
			skip: Int
			take: Int
		): [CW721Asset]
		dailyCW20Holder(
			code_id: Int,
			contract_address: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [DailyCW20Holder]
		dailyTxStatistics(
			date: DateTime,
			chain_id: String,
			skip: Int,
			take: Int
		): [DailyTxStatistics]
		delayJob(
			address: String,
			type: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [DelayJob]
		ibcDenom(hash: String, chain_id: String): [IBCDenom]
		inflation(chain_id: String): [Inflation]
		param(module: String, chain_id: String, skip: Int, take: Int): [Param]
		pool(chain_id: String): [Pool]
		proposal(
			proposal_id: String
			status: String
			chain_id: String
			skip: Int
			take: Int
		): [Proposal]
		smartContracts(
			code_id: Int,
			contract_hash: String,
			creator_address: String,
			tx_hash: String,
			height: Int,
			contract_name: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [SmartContracts]
		supply(chain_id: String): [Supply]
		transaction(
			type: String
			hash: String
			chain_id: String
			skip: Int
			take: Int
		): [Transaction]
		validator(
			operator_address: String
			status: String
			jailed: Boolean
			chain_id: String
			skip: Int
			take: Int
		): [Validator]
		vote(
			voter_address: String,
			proposal_id: Int,
			answer: String,
			tx_hash: String,
			chain_id: String,
			skip: Int,
			take: Int
		): [Vote]
	}

	# Common type
	type Coin {
		amount: String
		denom: String
	}
	type CustomInfo {
		chain_id: String
		chain_name: String
	}
	scalar DateTime
	scalar Json

	# AccountInfo type
	type Account {
		account: Json
	}
	type Delegation {
		delegator_address: String
		validator_address: String
		shares: String
	}
	type DelegationResponse {
		delegation: Delegation
		balance: [Coin]
	}
	type RedelegateEntry {
		redelegation_entry: RedelegationEntry
		balance: String
	}
	type Redelegation {
		delegator_address: String
		validator_src_address: String
		validator_dst_address: String
		entries: [RedelegateEntry]
	}
	type RedelegationEntry {
		creation_height: String
		completion_time: DateTime
		initial_balance: String
		shares_dst: String
	}
	type RedelegationResponse {
		redelegation: Redelegation
		entries: [RedelegateEntry]
	}
	type UnbondingResponse {
		delegator_address: String
		validator_address: String
		entries: [UndelegateEntry]
	}
	type UndelegateEntry {
		creation_height: String
		completion_time: DateTime
		initial_balance: String
		balance: String
	}
	type Reward {
		validator_address: String
		amount: String
		denom: String
	}
	type AccountInfo {
		id: String
		address: String
		account_auth: Account
		account_balances: [Coin]
		account_delegations: [DelegationResponse]
		account_redelegations: [RedelegationResponse]
		account_spendable_balances: [Coin]
		account_unbonding: [UnbondingResponse]
		account_claimed_rewards: [Reward]
		custom_info: CustomInfo
	}

	# AccountStatistics type
	type DailyStats {
		total_sent_tx: Stats
		total_received_tx: Stats
		total_sent_amount: Stats
		total_received_amount: Stats
	}
	type Stats {
		amount: Int
		percentage: Float
	}
	type AccountStatistics {
		id: String
		address: String
		per_day: [DailyStats]
		one_day: DailyStats
		three_days: DailyStats
		seven_days: DailyStats
		custom_info: CustomInfo!
	}

	# Block type
	type BlockIdPart {
		total: Int
		hash:  String
	}
	type BlockId {
		hash:  String
		parts: BlockIdPart
	}
	type BlockHeaderVersion {
		block: Int
	}
	type BlockHeader {
		version:              BlockHeaderVersion
		chain_id:             String
		height:               Int
		time:                 DateTime
		last_block_id:        BlockId
		last_commit_hash:     String
		data_hash:            String
		validators_hash:      String
		next_validators_hash: String
		consensus_hash:       String
		app_hash:             String
		last_results_hash:    String
		evidence_hash:        String
		proposer_address:     String
	}
	type BlockData {
		txs: [String]
	}
	type BlockDataEvidence {
		evidence: [Json]
	}
	type Signature {
		block_id_flag:     Int
		validator_address: String
		timestamp:         String
		signature:         String
	}
	type BlockLastCommit {
		height:     Int
		round:      Int
		block_id:   BlockId
		signatures: [Signature]
	}
	type BlockDetail {
		header:      BlockHeader
		data:        BlockData
		evidence:    BlockDataEvidence
		last_commit: BlockLastCommit
	}
	type Block {
		id:          String
		block_id:    BlockId
		block:       BlockDetail
		custom_info: CustomInfo
	}

	# CodeId type
	type CodeId {
		id: String
		code_id: String
		status: String
		contract_type: String
		createdAt: DateTime
		updatedAt: DateTime
		custom_info: CustomInfo
	}

	# CommunityPool type
	type CommunityPool {
		id: String
		pool: [Coin]
		custom_info: CustomInfo
	}

	# Asset type
	type CW20Asset {
		id: String
		asset_id: String
		code_id: String
		asset_info: Json
		contract_address: String
		token_id: String
		owner: String
		balance: String
		history: [String]
		createdAt: DateTime
		updatedAt: DateTime
		custom_info: CustomInfo
	}
	type CW721Asset {
		id: String
		asset_id: String
		code_id: String
		asset_info: Json
		contract_address: String
		token_id: String
		owner: String
		history: [String]
		createdAt: DateTime
		updatedAt: DateTime
		custom_info: CustomInfo
	}

	# DailyCW20Holder type
	type DailyCW20Holder {
		id: String
		code_id: Int
		contract_address: String
		old_holders: Int
		new_holders: Int
		change_percent: Float
		custom_info: CustomInfo
	}

	# DailyTxStatistics type
	type DailyTxStatistics {
		id: String
		daily_txs: Int
		daily_active_addresses: Int
		unique_addresses: Int
		date: DateTime
		custom_info: CustomInfo
	}

	# DelayJob type
	type DelayJob {
		id: String
		content: Json
		type: String
		expire_time: DateTime
		indexes: String
		custom_info: CustomInfo
	}

	# IBCDenom type
	type IBCDenom {
		id: String
		hash: String
		denom: String
	}

	# Inflation type
	type Inflation {
		id: String
		inflation: String
		custom_info: CustomInfo
	}

	# Param type
	type Param {
		id: String
		module: String
		params: Json
		custom_info: CustomInfo
	}

	# Pool type
	type Pool {
		id: String
		not_bonded_tokens: String
		bonded_tokens: String
		custom_info: CustomInfo
	}

	# Proposal type
	type Changes {
		subspace: String
		key: String
		value: String
	}
	type FinalTallyResult {
		yes: String
		no: String
		abstain: String
		no_with_veto: String
	}
	type Deposit {
		proposal_id: String
		depositor: String
		amount: [Coin]
	}
	type Content {
		type: String
		title: String
		description: String
		changes: [Changes]
		recipient: String
		amount: [Coin]
	}
	type Proposal {
		id: String
		proposal_id: Int
		content: Content
		status: String
		final_tally_result: FinalTallyResult
		submit_time: DateTime
		deposit_end_time: DateTime
		total_deposit: [Coin]
		voting_start_time: DateTime
		voting_end_time: DateTime
		tally: FinalTallyResult
		deposit: [Deposit]
		custom_info: CustomInfo
	}

	# SmartContracts type
	type SmartContracts {
		id: String
		height: Int
		code_id: Int
		contract_name: String
		contract_address: String
		creator_address: String
		contract_hash: String
		tx_hash: String
		custom_info: CustomInfo
	}

	# Supply type
	type Supply {
		id: String
		supply: [Coin]
		custom_info: CustomInfo
	}

	# Transaction type
	type PublicKey {
		type: String
		key: String
	}
	type Mode {
		mode: String
	}
	type ModeInfo {
		single: Mode
	}
	type Body {
		messages: [Json]
		memo: String
		timeout_height: String
		extension_options: [Json]
		non_critical_extension_options: [Json]
	}
	type SignerInfo {
		public_key: PublicKey
		mode_info: ModeInfo
		sequence: String
	}
	type Fee {
		amount: [Coin]
		gas_limit: String
		payer: String
		granter: String
	}
	type AuthInfo {
		signer_infos: [SignerInfo]
		fee: Fee
	}
	type TxInput {
		body: Body
		auth_info: AuthInfo
		signatures: [String]
	}
	type Attribute {
		key: String
		value: String
		index: Boolean
	}
	type Event {
		type: String
		attributes: [Attribute]
	}
	type Log {
		msg_index: Int
		log: String
		events: [Event]
	}
	type TxResponse {
		height: Int
		txhash: String
		codespace: String
		code: String
		data: String
		raw_log: String
		logs: [Log]
		info: String
		gas_wanted: String
		gas_used: String
		tx: Json
		timestamp: DateTime
		events: [Event]
	}
	type TxResult {
		code: Int
		data: String
		log: String
		info: String
		gas_wanted: String
		gas_used: String
		events: [Attribute]
		codespace: String
	}
	type Transaction {
		id: String
		tx: TxInput
		tx_response: TxResponse
		custom_info: CustomInfo
	}

	# Validator type
	type ConsensusPubkey {
		type: String
		key: String
	}
	type Description {
		moniker: String
		identity: String
		website: String
		details: String
		security_contact: String
	}
	type CommissionRate {
		rate: String
		max_rate: String
		max_change_rate: String
	}
	type Commission {
		commission_rates: CommissionRate
		update_time: String
	}
	type Validator {
		id: String
		operator_address: String
		consensus_pubkey: ConsensusPubkey
		jailed: Boolean
		status: String
		tokens: String
		delegator_shares: String
		description: Description
		unbonding_height: String
		unbonding_time: String
		commission: Commission
		min_self_delegation: String
		consensus_hex_address: String
		custom_info: CustomInfo
	}

	# Vote type
	type Vote {
		id: String
		voter_address: String
		proposal_id: Int
		answer: String
		txhash: String
		timestamp: DateTime
		height: Int
		custom_info: CustomInfo
	}
`;

export const Resolvers = {
	DateTime: new GraphQLScalarType({
		name: 'DateTime',
		description: 'DateTime custom scalar type',
		parseValue(value: any) {
			return new Date(value);
		},
		parseLiteral(ast: any) {
			if (ast.kind === Kind.INT) {
				return parseInt(ast.value, 10);
			}
			return null;
		},
		serialize(value: any) {
			const date = new Date(value);
			return date.toISOString();
		},
	}),
	Json: GraphQLJSON,
	Query: {
		accountInfo: (_parent: any, args: any, context: any, info: any) => {
			console.log(`Query accountInfo with args ${JSON.stringify(args)}`);
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.address !== '' && args.address !== undefined) where.address = args.address;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.account_info.findMany({
				where,
				skip,
				take,
			});
		},
		accountStatistics: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.address !== '' && args.address !== undefined) where.address = args.address;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.account_statistics.findMany({
				where,
				skip,
				take,
			});
		},
		block: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.hash !== '' && args.hash !== undefined) where.block_id = { hash: args.hash };
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.block.findMany({
				where,
				skip,
				take,
			});
		},
		codeId: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.code_id !== '' && args.code_id !== undefined) where.code_id = args.code_id;
			if (args.contract_type !== '' && args.contract_type !== undefined)
				where.contract_type = args.contract_type;
			if (args.status !== '' && args.status !== undefined) where.status = args.status;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.code_id.findMany({
				where,
				skip,
				take,
			});
		},
		communityPool: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			return prisma.community_pool.findMany({
				where,
			});
		},
		cw20Asset: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.code_id !== '' && args.code_id !== undefined) where.code_id = args.code_id;
			if (args.contract_address !== '' && args.contract_address !== undefined)
				where.contract_address = args.contract_address;
			if (args.owner !== '' && args.owner !== undefined) where.owner = args.owner;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.cw20_asset.findMany({
				where,
				skip,
				take,
			});
		},
		cw721Asset: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.code_id !== '' && args.code_id !== undefined) where.code_id = args.code_id;
			if (args.contract_address !== '' && args.contract_address !== undefined)
				where.contract_address = args.contract_address;
			if (args.owner !== '' && args.owner !== undefined) where.owner = args.owner;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.cw721_asset.findMany({
				where,
				skip,
				take,
			});
		},
		dailyCW20Holder: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.code_id !== '' && args.code_id !== undefined) where.code_id = args.code_id;
			if (args.contract_address !== '' && args.contract_address !== undefined) where.contract_address = args.contract_address;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.daily_cw20_holder.findMany({
				where,
				skip,
				take,
			});
		},
		dailyTxStatistics: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.date !== '' && args.date !== undefined) where.date = args.date;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.daily_tx_statistics.findMany({
				where,
				skip,
				take,
			});
		},
		delayJob: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.address !== '' && args.address !== undefined) where.address = args.address;
			if (args.type !== '' && args.type !== undefined) where.address = args.address;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.delay_job.findMany({
				where,
				skip,
				take,
			});
		},
		ibcDenom: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.hash !== '' && args.hash !== undefined) where.hash = args.hash;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			return prisma.ibc_denom.findMany({
				where,
			});
		},
		inflation: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			return prisma.inflation.findMany({
				where,
			});
		},
		param: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.module !== '' && args.module !== undefined) where.module = args.module;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.param.findMany({
				where,
				skip,
				take,
			});
		},
		pool: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			return prisma.pool.findMany({
				where,
			});
		},
		proposal: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.proposal_id !== '' && args.proposal_id !== undefined)
				where.proposal_id = args.proposal_id;
			if (args.status !== '' && args.status !== undefined) where.status = args.status;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.proposal.findMany({
				where,
				skip,
				take,
			});
		},
		smartContracts: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.code_id !== '' && args.code_id !== undefined) where.code_id = args.code_id;
			if (args.contract_hash !== '' && args.contract_hash !== undefined)
				where.contract_hash = args.contract_hash;
			if (args.creator_address !== '' && args.creator_address !== undefined)
				where.creator_address = args.creator_address;
			if (args.tx_hash !== '' && args.tx_hash !== undefined) where.tx_hash = args.tx_hash;
			if (args.height !== '' && args.height !== undefined) where.height = args.height;
			if (args.contract_name !== '' && args.contract_name !== undefined)
				where.contract_name = args.contract_name;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.smart_contracts.findMany({
				where,
				skip,
				take,
			});
		},
		supply: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			return prisma.supply.findMany({
				where,
			});
		},
		transaction: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.type !== '' && args.type !== undefined)
				where.tx = { body: { messages: { '@type': args.type } } };
			if (args.hash !== '' && args.hash !== undefined) where.tx_response = { txhash: args.hash };
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.transaction.findMany({
				where,
				skip,
				take,
			});
		},
		validator: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.operator_address !== '' && args.operator_address !== undefined)
				where.operator_address = args.operator_address;
			if (args.status !== '' && args.status !== undefined) where.status = args.status;
			if (args.jailed !== '' && args.jailed !== undefined) where.jailed = args.jailed;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.validator.findMany({
				where,
				skip,
				take,
			});
		},
		vote: (_parent: any, args: any, context: any, info: any) => {
			let prisma = prismaAuraTestnet;
			const where: any = {};
			if (args.voter_address !== '' && args.voter_address !== undefined)
				where.voter_address = args.voter_address;
			if (args.proposal_id !== '' && args.proposal_id !== undefined)
				where.proposal_id = args.proposal_id;
			if (args.answer !== '' && args.answer !== undefined) where.answer = args.answer;
			if (args.tx_hash !== '' && args.tx_hash !== undefined) where.tx_hash = args.tx_hash;
			if (args.chain_id !== '' && args.chain_id !== undefined) prisma = handleChainId(args.chain_id);
			const take = args.take || 20;
			const skip = args.skip !== undefined ? args.skip * take : 0;
			return prisma.vote.findMany({
				where,
				skip,
				take,
			});
		},
	},
};

const handleChainId = (chain_id: string) => {
	switch (Config.NAMESPACE) {
		case ENV_NAMESPACE.DEV:
			switch (chain_id) {
				case CHAIN_ID_DEV.AURA_TESTNET:
					return prismaAuraTestnet;
				case CHAIN_ID_DEV.SERENITY_TESTNET:
					return prismaSerenityTestnet;
				case CHAIN_ID_DEV.EUPHORIA_TESTNET:
					return prismaEuphoriaTestnet;
				case CHAIN_ID_DEV.THETA_TESTNET:
					return prismaThetaTestnet;
				case CHAIN_ID_DEV.EVMOS_TESTNET:
					return prismaEvmosTestnet;
				default:
					return prismaAuraTestnet;
			}
		case ENV_NAMESPACE.STAGING:
			switch (chain_id) {
				case CHAIN_ID_DEV.AURA_TESTNET:
					return prismaAuraTestnet;
				case CHAIN_ID_DEV.SERENITY_TESTNET:
					return prismaSerenityTestnet;
				case CHAIN_ID_DEV.EUPHORIA_TESTNET:
					return prismaEuphoriaTestnet;
				default:
					return prismaAuraTestnet;
			}
		case ENV_NAMESPACE.PROD:
			switch (chain_id) {
				case CHAIN_ID_PROD.EUPHORIA:
					return prismaEuphoriaProd;
				case CHAIN_ID_PROD.COSMOSHUB:
					return prismaCosmoshubProd;
				case CHAIN_ID_PROD.OSMOSIS:
					return prismaOsmosisProd;
				default:
					return prismaEuphoriaProd;
			}
		default:
			return prismaAuraTestnet;
	}
};