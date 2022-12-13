/* eslint-disable camelcase */
import { model, models, Types, Schema } from 'mongoose';
import { definitionType } from 'types';
import { IIBCDenom } from '../entities';

const definition: definitionType<IIBCDenom> = (collection?: string) => ({
	_id: Types.ObjectId,
	hash: String,
	denom: String,
});

export const ibcDenomMongoModel = (collection: string): unknown => {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	const schema = new Schema<IIBCDenom>(definition(collection), {
		autoIndex: true,
		collection,
	});
	// @ts-ignore
	schema.index({ hash: 1, denom: 1 }, { unique: true });
	return models[collection] || model(collection, schema);
};
