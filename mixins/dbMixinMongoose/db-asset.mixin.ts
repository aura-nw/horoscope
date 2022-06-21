'use strict';

import { assetMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_ASSET;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAssetMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: assetMongoModel(dbInfo.collection),
});

export const dbAssetMixin = dbBaseMixin.getMixin();
