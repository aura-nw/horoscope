'use strict';

import { blockMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_BLOCK_AGGREGATE;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbBlockAggregateMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: blockMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbBlockAggregateMixin = dbBaseMixin.getMixin();
