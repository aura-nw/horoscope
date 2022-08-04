import { Kind } from "graphql";
import { gql } from "moleculer-apollo-server";
import { prisma } from "../../utils/context";
const { GraphQLScalarType } = require('graphql');
const GraphQLJSON = require('graphql-type-json');

export const TypeDefs = gql`
type Query {
    hello: String
    accountAuth(address: String, chain_id: String, skip: Int, take: Int): AccountAuthResponse
    accountBalances(address: String, chain_id: String, skip: Int, take: Int): AccountBalancesResponse
    accountSpendableBalances(address: String, chain_id: String, skip: Int, take: Int): AccountSpendableBalancesResponse
    accountDelegations(address: String, chain_id: String, skip: Int, take: Int): AccountDelegationsResponse
    accountRedelegations(address: String, chain_id: String, skip: Int, take: Int): AccountRedelegationsResponse
    accountUnbonds(address: String, chain_id: String, skip: Int, take: Int): AccountUnbondsResponse
    block(hash: String, chain_id: String, skip: Int, take: Int): [Block]
    codeId(code_id: String, contract_type: String, status: String, chain_id: String, skip: Int, take: Int): [CodeId]
    communityPool(chain_id: String): [CommunityPool]
    cw20Asset(code_id: String, contract_address: String, owner: String, chain_id: String, skip: Int, take: Int): [CW20Asset]
    cw721Asset(code_id: String, contract_address: String, owner: String, chain_id: String, skip: Int, take: Int): [CW721Asset]
    inflation(chain_id: String): [Inflation]
    param(module: String, chain_id: String, skip: Int, take: Int): [Param]
    pool(chain_id: String): [Pool]
    proposal(proposal_id: String, status: String, chain_id: String, skip: Int, take: Int): [Proposal]
    supply(chain_id: String): [Supply]
    transaction(type: String, hash: String, chain_id: String, skip: Int, take: Int): [Transaction]
    validator(operator_address: String, status: String, jailed: Boolean, chain_id: String, skip: Int, take: Int): [Validator]
}

# Common type
type Coin {
    amount: String
    denom: String
}
type CustomInfo {
    chain_id:   String
    chain_name: String
}
scalar DateTime
scalar Json

# AccountAuth type
type AccountPubKey {
    type:  String
    value: String
}
type AccountValue {
    address:        String
    public_key:     AccountPubKey
    account_number: String
    sequence:       String
}
type AccountResult {
    type:  String
    value: AccountValue
}
type Account {
    height: String
    result: AccountResult
}
type AccountAuth {
    id: String
    address: String
    account: Account
    custom_info: CustomInfo
}
type AccountAuthResponse {
    accounts: [AccountAuth]
    total: Int
}

# AccountBalances type
type AccountBalances {
    id: String
    address: String
    balances: [Coin]
    custom_info: CustomInfo
}
type AccountBalancesResponse {
    accounts: [AccountBalances]
    total: Int
}

# AccountSpendableBalances type
type AccountSpendableBalances {
    id: String
    address: String
    spendable_balances: [Coin]
    custom_info: CustomInfo
}
type AccountSpendableBalancesResponse {
    accounts: [AccountSpendableBalances]
    total: Int
}

# AccountDelegations type
type Delegation {
    delegator_address: String
    validator_address: String
    shares:            String
}
type DelegationResponse {
    delegation: Delegation
    balance:    Coin
}
type AccountDelegations {
    id: String
    address: String
    delegation_responses: [DelegationResponse]
    custom_info: CustomInfo
}
type AccountDelegationsResponse {
    accounts: [AccountDelegations]
    total: Int
}

# AccountRedelegations type
type RedelegationEntry {
    creation_height: String
    completion_time: String
    initial_balance: String
    shares_dst:      String
}
type RedelegateEntry {
    redelegation_entry: RedelegationEntry
    balance:            String
}
type Redelegation {
    delegator_address:     String
    validator_src_address: String
    validator_dst_address: String
    entries:               [RedelegateEntry]
}
type RedelegationResponse {
    redelegation: Redelegation
    entries:      [RedelegateEntry]
}
type AccountRedelegations {
    id: String
    address: String
    redelegation_responses: [RedelegationResponse]
    custom_info: CustomInfo
}
type AccountRedelegationsResponse {
    accounts: [AccountRedelegations]
    total: Int
}

# AccountUnbonds type
type UndelegateEntry {
    creation_height: String
    completion_time: String
    initial_balance: String
    balance:         String
}
type UnbondingResponse {
    delegator_address: String
    validator_address: String
    entries:           [UndelegateEntry]
}
type AccountUnbonds {
    id: String
    address: String
    unbonding_responses: [UnbondingResponse]
    custom_info: CustomInfo
}
type AccountUnbondsResponse {
    accounts: [AccountUnbonds]
    total: Int
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
    constract_address: String
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
    constract_address: String
    token_id: String
    owner: String
    history: [String]
    createdAt: DateTime
    updatedAt: DateTime
    custom_info: CustomInfo
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
    key:      String
    value:    String
}
type FinalTallyResult {
    yes:          String
    no:           String
    abstain:      String
    no_with_veto: String
}
type Deposit {
    proposal_id: String
    depositor:   String
    amount:      [Coin]
}
type Content {
    type:        String
    title:       String
    description: String
    changes:     [Changes]
    recipient:   String
    amount:      [Coin]
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

# Supply type
type Supply {
    id: String
    supply: [Coin]
    custom_info: CustomInfo
}

# Transaction type
type PublicKey {
    type: String
    key:  String
}
type Mode {
    mode: String
}
type ModeInfo {
    single: Mode
}
type Body {
    messages:                       [Json]
    memo:                           String
    timeout_height:                 String
    extension_options:              [Json]
    non_critical_extension_options: [Json]
}
type SignerInfo {
    public_key: PublicKey
    mode_info:  ModeInfo
    sequence:   String
}
type Fee {
    amount:    [Coin]
    gas_limit: String
    payer:     String
    granter:   String
}
type AuthInfo {
    signer_infos: [SignerInfo]
    fee:          Fee
}
type TxInput {
    body:       Body
    auth_info:  AuthInfo
    signatures: String # TODO: change to String[]? (currently error due to findMany)
}
type Attribute {
    key:   String
    value: String
    index: Boolean
}
type Event {
    type:       String
    attributes: [Attribute]
}
type Log {
    msg_index: Int
    log:       String
    events:    [Event]
}
type TxResponse {
    height:     String # TODO: change to Int? (currently error due to findMany)
    txhash:     String
    codespace:  String
    code:       String
    data:       String
    raw_log:    String
    logs:       [Log]
    info:       String
    gas_wanted: String
    gas_used:   String
    tx:         Json
    timestamp:  String # TODO: change to DateTime? (currently error due to findMany)
    events:     [Event]
}
type TxResult {
    code:       Int
    data:       String
    log:        String
    info:       String
    gas_wanted: String
    gas_used:   String
    events:     [Attribute]
    codespace:  String
}
type Transaction {
    id:          String
    tx:          TxInput
    tx_response: TxResponse
    custom_info: CustomInfo
}

# Validator type
type ConsensusPubkey {
    type: String
    key:  String
}
type Description {
    moniker:          String
    identity:         String
    website:          String
    details:          String
    security_contact: String
}
type CommissionRate {
    rate:            String
    max_rate:        String
    max_change_rate: String
}
type Commission {
    commission_rates: CommissionRate
    update_time:      String
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
        hello() { return "Hello world!"; },
        accountAuth: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_auth.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_auth.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        accountBalances: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_balances.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_balances.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        accountSpendableBalances: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_spendable_balances.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_spendable_balances.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        accountDelegations: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_delegations.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_delegations.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        accountRedelegations: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_redelegations.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_redelegations.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        accountUnbonds: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.address !== '') where.address = args.address;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            const result = prisma.account_unbonds.findMany({
                // where,
                skip,
                take,
            });
            const total = prisma.account_unbonds.count({
                // where,
            });
            return {
                accounts: result,
                total,
            }
        },
        block: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.hash !== '') where.block_id = { hash: args.hash };
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.block.findMany({
                // where,
                skip,
                take,
            });
        },
        codeId: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.code_id !== '') where.code_id = args.code_id;
            if (args.contract_type !== '') where.contract_type = args.contract_type;
            if (args.status !== '') where.status = args.status;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.code_id.findMany({
                // where,
                skip,
                take,
            });
        },
        communityPool: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            return prisma.community_pool.findMany({
                // where,
            });
        },
        cw20Asset: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.code_id !== '') where.code_id = args.code_id;
            if (args.contract_address !== '') where.constract_address = args.contract_address;
            if (args.owner !== '') where.owner = args.owner;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.cw20_asset.findMany({
                // where,
                skip,
                take,
            });
        },
        cw721Asset: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.code_id !== '') where.code_id = args.code_id;
            if (args.contract_address !== '') where.constract_address = args.contract_address;
            if (args.owner !== '') where.owner = args.owner;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.cw721_asset.findMany({
                // where,
                skip,
                take,
            });
        },
        inflation: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            return prisma.inflation.findMany({
                // where,
            });
        },
        param: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.module !== '') where.module = args.module;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.param.findMany({
                // where,
                skip,
                take,
            });
        },
        pool: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            return prisma.pool.findMany({
                // where,
            });
        },
        proposal: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.proposal_id !== '') where.proposal_id = args.proposal_id;
            if (args.status !== '') where.status = args.status;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.proposal.findMany({
                // where,
                skip,
                take,
            });
        },
        supply: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            return prisma.supply.findMany({
                // where,
            });
        },
        transaction: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.type !== '') where.tx = { body: { messages: { '@type': args.type } } };
            if (args.hash !== '') where.tx_response = { txhash: args.hash };
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.transaction.findMany({
                // where,
                skip,
                take,
            });
        },
        validator: (_parent: any, args: any, context: any, info: any) => {
            const where: any = {};
            if (args.operator_address !== '') where.operator_address = args.operator_address;
            if (args.status !== '') where.status = args.status;
            if (args.jailed !== '') where.jailed = args.jailed;
            if (args.chain_id !== '') where.custom_info = { chain_id: args.chain_id };
            const take = args.take || 20;
            const skip = (args.skip !== 0) ? args.skip * take : 0;
            return prisma.validator.findMany({
                // where,
                skip,
                take,
            });
        },
    },
};