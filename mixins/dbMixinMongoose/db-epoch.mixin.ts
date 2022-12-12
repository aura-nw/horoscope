'use strict';

import { Config } from '../../common';
import { epochMongoModel } from '../../model/osmosis/epoch.model';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_EPOCH;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbEpochMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: epochMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbEpochMixin = dbBaseMixin.getMixin();
