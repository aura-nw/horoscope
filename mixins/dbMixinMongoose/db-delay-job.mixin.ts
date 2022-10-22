'use strict';

import { Config } from '../../common';
import { delayJobMongoModel } from '../../model/delay-job.model';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_DELAY_JOB;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbDelayJobMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: delayJobMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbDelayJobMixin = dbBaseMixin.getMixin();
