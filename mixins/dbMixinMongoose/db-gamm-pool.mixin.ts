'use strict';

import { Config } from '../../common';
import { gammPoolMongoModel } from '../../model/osmosis/gamm-pool.model';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_GAMM_POOL;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbGammPoolMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: gammPoolMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbGammPoolMixin = dbBaseMixin.getMixin();
