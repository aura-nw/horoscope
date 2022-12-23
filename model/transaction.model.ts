/* eslint-disable camelcase */
// @ts-nocheck
import { model, models, Schema, Types } from 'mongoose';
import { ITransaction } from '../entities';
import { definitionType } from '../types';
import { customInfoModel } from './custom-info.model';

const definition: definitionType<ITransaction> = (collection?: string) => ({
	_id: Types.ObjectId,
	tx: {
		body: {
			messages: [Object],
			memo: String,
			timeout_height: String,
			extension_options: [Object],
			non_critical_extension_options: [Object],
		},
		auth_info: {
			signer_infos: [
				{
					public_key: {
						'@type': String,
						key: String,
					},
					mode_info: {
						single: {
							mode: String,
						},
					},
					sequence: String,
				},
			],
			fee: {
				amount: [
					{
						amount: String,
						denom: String,
					},
				],
				gas_limit: String,
				payer: String,
				granter: String,
			},
		},
		signatures: [String],
	},
	tx_response: {
		height: Number,
		txhash: {
			type: String,
			index: true,
			unique: true,
		},
		codespace: String,
		code: String,
		data: String,
		raw_log: String,
		logs: [
			{
				msg_index: Number,
				log: String,
				events: [
					{
						type: { type: String },
						attributes: [
							{
								key: String,
								value: String,
							},
						],
					},
				],
			},
		],
		info: String,
		gas_wanted: String,
		gas_used: String,
		tx: Object,
		timestamp: Date,
		events: [
			{
				type: { type: String },
				attributes: [
					{
						key: String,
						value: String,
						index: Boolean,
					},
				],
			},
		],
	},
	custom_info: customInfoModel,
	indexes: Object,
});

export const transactionMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// Strict: false,
		collection,
	});
	schema.index({ 'tx_response.height': 1, 'custom_info.chain_id': 1 });
	schema.index({ 'tx_response.height': -1, 'custom_info.chain_id': 1 });

	schema.index(
		{ 'indexes.delegate_validator': 1 },
		{ name: 'delegate_validator_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.execute__contract_address': 1 },
		{ name: 'execute_smart_contract_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.proposal_deposit_proposal_id': 1 },
		{ name: 'proposal_deposit_proposal_id_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.instantiate__contract_address': 1 },
		{ name: 'instantiate_contract_address_asc', sparse: true },
	);
	schema.index({ 'indexes.message_action': 1 }, { name: 'message_action', sparse: true });
	schema.index(
		{ 'indexes.proposal_vote_proposal_id': 1 },
		{ name: 'proposal_vote_proposal_id_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.proposal_vote_proposal_option': 1 },
		{ name: 'proposal_vote_proposal_option_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.redelegate_destination_validator': 1 },
		{ name: 'redelegate_destination_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.redelegate_source_validator': 1 },
		{ name: 'redelegate_source_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.send_packet_packet_sequence': 1 },
		{ name: 'send_packet_packet_sequence_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.store_code_code_id': 1 },
		{ name: 'store_code_code_id_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.submit_proposal_proposal_id': 1 },
		{ name: 'submit_proposal_proposal_id_asc', sparse: true },
	);
	schema.index({ 'indexes.message_sender': 1 }, { name: 'message_sender_asc', sparse: true });

	schema.index(
		{ 'indexes.recv_packet_packet_sequence': 1 },
		{ name: 'recv_packet_packet_sequence_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.timeout_packet_packet_sequence': 1 },
		{ name: 'timeout_packet_packet_sequence_asc', sparse: true },
	);
	schema.index(
		{ 'indexes.transfer_recipient': 1 },
		{ name: 'transfer_recipient_asc', sparse: true },
	);
	schema.index({ 'indexes.transfer_sender': 1 }, { name: 'transfer_sender_asc', sparse: true });

	schema.index({ 'indexes.unbond_validator': 1 }, { name: 'unbond_validator_asc', sparse: true });
	schema.index(
		{ 'indexes.acknowledge_packet_packet_sequence': 1 },
		{ name: 'acknowledge_packet_packet_sequence_asc', sparse: true },
	);
	schema.index({ 'indexes.wasm_action': 1 }, { name: 'wasm_action_asc', sparse: true });
	schema.index(
		{ 'indexes.wasm__contract_address': 1 },
		{ name: 'wasm__contract_address_asc', sparse: true },
	);
	schema.index({ 'indexes.wasm_owner': 1 }, { name: 'wasm_owner_asc', sparse: true });
	schema.index({ 'indexes.wasm_recipient': 1 }, { name: 'wasm_recipient_asc', sparse: true });
	schema.index({ 'indexes.wasm_spender': 1 }, { name: 'wasm_spender_asc', sparse: true });
	schema.index(
		{ 'indexes.withdraw_rewards_validator': 1 },
		{ name: 'withdraw_rewards_validator_asc', sparse: true },
	);

	schema.index({ 'indexes.addresses': 1 }, { sparse: true });
	schema.index({ 'indexes.timestamp': -1 });

	return models[collection] || model(collection, schema);
};
