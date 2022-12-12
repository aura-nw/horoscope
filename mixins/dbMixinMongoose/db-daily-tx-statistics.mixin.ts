'use strict';

import { dailyTxStatisticsMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_DAILY_TX_STATISTICS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbDailyTxStatisticsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: dailyTxStatisticsMongoModel(dbInfo.collection),
});

export const dbDailyTxStatisticsMixin = dbBaseMixin.getMixin();
