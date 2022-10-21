'use strict';

import { communityPoolMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_COMMUNITY_POOL;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCommunityPoolMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: communityPoolMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCommunityPoolMixin = dbBaseMixin.getMixin();
