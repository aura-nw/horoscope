'use strict';

import { feegrantMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';
const dbInfo = Config.DB_FEEGRANT;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbFeegrantMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: feegrantMongoModel(dbInfo.collection),
});

export const dbFeegrantMixin = dbBaseMixin.getMixin();
