import { model, models, Schema, Types } from 'mongoose';
import { definitionType, ObjectIdNull } from '../types';

export interface ICodeID {
	_id: ObjectIdNull;
	code_id: String;
	status: String;
}
export enum Status {
	WAITING = "WAITING",
	INDEXING = "INDEXING",
	COMPLETED = "COMPLETED",
	REJECTED = "REJECTED",
	TBD = "TBD",
}
const definition: definitionType<ICodeID> = (collection?: string) => ({
	_id: Types.ObjectId,
	code_id: { type: String, index: true, unique: true },
	status: {
		type: String,
		enum: Status
	}
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
	return models[collection] || model(collection, schema);
};
