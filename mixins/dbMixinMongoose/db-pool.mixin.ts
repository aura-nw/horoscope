'use strict';

import { poolMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_POOL;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbPoolMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: poolMongoModel(dbInfo.collection),
});

export const dbPoolMixin = dbBaseMixin.getMixin();
