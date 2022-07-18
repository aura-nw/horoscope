'use strict';

import { paramMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_PARAM;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbParamMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: paramMongoModel(dbInfo.collection),
});

export const dbParamMixin = dbBaseMixin.getMixin();
