'use strict';

import { Config } from '../../common';
import { accountInfoMongoModel } from '../../model';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_ACCOUNT_INFO;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountInfoMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountInfoMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbAccountInfoMixin = dbBaseMixin.getMixin();
