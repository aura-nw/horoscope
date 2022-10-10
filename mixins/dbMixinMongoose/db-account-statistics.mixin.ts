'use strict';

import { accountStatisticsMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_ACCOUNT_STATISTICS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountStatisticsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountStatisticsMongoModel(dbInfo.collection),
});

export const dbAccountStatisticsMixin = dbBaseMixin.getMixin();