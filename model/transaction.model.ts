import { ITransaction } from '../entities';
import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
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
});

export const transactionMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema(definition(collection), {
		autoIndex: true,
		// strict: false,
		collection: collection,
	});
	schema.index({ 'tx_response.height': 1, 'custom_info.chain_id': 1 });
	schema.index({ 'tx_response.height': -1, 'custom_info.chain_id': 1 });
	schema.index({
		'custom_info.chain_id': 1,
		'tx_response.events.type': 1,
		'tx_response.events.attributes.key': 1,
	});
	return models[collection] || model(collection, schema);
};
