'use strict';

import CallApiMixin from '../callApi/call-api.mixin';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';
import { accountRedelegationsMongoModel } from '../../model';

const dbInfo = Config.DB_ACCOUNT_REDELEGATIONS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountRedelegationsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountRedelegationsMongoModel(dbInfo.collection),
});

export const dbAccountRedelegationsMixin = dbBaseMixin.getMixin();