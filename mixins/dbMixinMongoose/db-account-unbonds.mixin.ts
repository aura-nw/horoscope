'use strict';

import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';
import { accountUnbondsMongoModel } from '../../model';

const dbInfo = Config.DB_ACCOUNT_UNBONDS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountUnbondsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountUnbondsMongoModel(dbInfo.collection),
});

export const dbAccountUnbondsMixin = dbBaseMixin.getMixin();