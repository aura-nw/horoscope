'use strict';

import { cw4973MediaMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CW4973_MEDIA_LINK;

const dbCW4973MediaBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCW4973MediaLinkMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: cw4973MediaMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCW4973MediaLinkMixin = dbCW4973MediaBaseMixin.getMixin();
