'use strict';

import { inflationMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_INFLATION;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbInflationMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: inflationMongoModel(dbInfo.collection),
});

export const dbInflationMixin = dbBaseMixin.getMixin();
