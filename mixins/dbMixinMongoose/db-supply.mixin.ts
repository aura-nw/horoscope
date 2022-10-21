'use strict';

import { supplyMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_SUPPLY;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbSupplyMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: supplyMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbSupplyMixin = dbBaseMixin.getMixin();
