'use strict';

import { ibcDenomMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_IBC_DENOM;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbIBCDenomMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: ibcDenomMongoModel(dbInfo.collection),
});

export const dbIBCDenomMixin = dbBaseMixin.getMixin();