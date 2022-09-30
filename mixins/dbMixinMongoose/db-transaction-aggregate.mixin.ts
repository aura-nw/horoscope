'use strict';

import { transactionMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_TRANSACTION_AGGREGATE;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbTransactionAggregateMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: transactionMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbTransactionAggregateMixin = dbBaseMixin.getMixin();
