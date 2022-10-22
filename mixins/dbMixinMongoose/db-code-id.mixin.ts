'use strict';

import { codeidMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CODE_ID;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCodeIDMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: codeidMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCodeIDMixin = dbBaseMixin.getMixin();
