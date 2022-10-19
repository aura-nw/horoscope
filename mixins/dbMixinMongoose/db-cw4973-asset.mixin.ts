'use strict';

import { cw4973AssetMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CW4973_ASSET;

const dbCW4973BaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCW4973AssetMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: cw4973AssetMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCW4973AssetMixin = dbCW4973BaseMixin.getMixin();
