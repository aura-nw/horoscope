import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';
import { customInfoModel } from './custom-info.model';

export interface ICodeID {
	_id: ObjectIdNull;
	code_id: String;
	status: String;
	contract_type: String;
}
export enum CodeIDStatus {
	WAITING = "WAITING",
	// INDEXING = "INDEXING",
	COMPLETED = "COMPLETED",
	REJECTED = "REJECTED",
	TBD = "TBD",
}
const definition: definitionType<ICodeID> = (collection?: string) => ({
	_id: Types.ObjectId,
	code_id: { type: String },
	status: {
		type: String,
		enum: CodeIDStatus
	},
	contract_type: { type: String, default: null},
	custom_info: customInfoModel,
})


export const codeidMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<ICodeID>(definition(collection), {
		autoIndex: true,
		collection: collection,
		timestamps: {
			createdAt: true,
			updatedAt: true
		}
		// strict: true
	});
	schema.index({ 'custom_info.chain_id': 1, 'code_id': 1 });
	return models[collection] || model(collection, schema);
};
