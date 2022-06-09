'use strict';

import { transactionMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_TRANSACTION;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbTransactionMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: transactionMongoModel(dbInfo.collection),
});

export const dbTransactionMixin = dbBaseMixin.getMixin();
