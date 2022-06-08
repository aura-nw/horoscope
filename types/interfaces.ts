import { IncomingMessage } from 'http';
import { ActionSchema, ActionParamSchema } from 'moleculer';
import { ActionOptions } from '@ourparentcenter/moleculer-decorators-extended';
import { Schema, SchemaType, SchemaTypeOpts, Types } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/naming-convention
export type definitionType<T> = (
	collection?: string,
) => Record<keyof Required<T>, SchemaTypeOpts<any> | Schema | SchemaType>;

export type ObjectId = Types.ObjectId | string;
export type ObjectIdNull = ObjectId | null;

export type DBDialog = 'local' | 'file' | 'mongodb';

export interface DBInfo {
	dialect: DBDialog;
	user: string;
	password: string;
	host: string;
	port: number;
	dbname: string;
	collection: string;
}
