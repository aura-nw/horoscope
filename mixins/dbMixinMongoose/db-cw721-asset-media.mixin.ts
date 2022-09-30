'use strict';

import { cw721MediaMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_CW721_MEDIA_LINK;

const dbCW721MediaBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbCW721MediaLinkMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: cw721MediaMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbCW721MediaLinkMixin = dbCW721MediaBaseMixin.getMixin();
