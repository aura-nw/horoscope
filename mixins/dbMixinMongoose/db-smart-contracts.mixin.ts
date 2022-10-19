'use strict';

import { Config } from '../../common';
import { smartContractsMongoModel } from '../../model';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_SMART_CONTRACTS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbSmartContractsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: smartContractsMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbSmartContractsMixin = dbBaseMixin.getMixin();