'use strict';

import { cw721AssetMongoModel, cw20AssetMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CW721_ASSET;

const dbCW721BaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCW721AssetMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: cw721AssetMongoModel(dbInfo.collection),
});

export const dbCW721AssetMixin = dbCW721BaseMixin.getMixin();
