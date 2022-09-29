'use strict';

import { cw20AssetMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CW20_ASSET;

const dbCW20BaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCW20AssetMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: cw20AssetMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCW20AssetMixin = dbCW20BaseMixin.getMixin();
