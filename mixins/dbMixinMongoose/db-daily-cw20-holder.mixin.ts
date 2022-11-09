'use strict';

import { dailyCw20HolderMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_DAILY_CW20_HOLDER;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbDailyCw20HolderMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: dailyCw20HolderMongoModel(dbInfo.collection),
});

export const dbDailyCw20HolderMixin = dbBaseMixin.getMixin();