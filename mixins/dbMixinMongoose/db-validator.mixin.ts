'use strict';

import { validatorMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_VALIDATOR;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbValidatorMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: validatorMongoModel(dbInfo.collection),
});

export const dbValidatorMixin = dbBaseMixin.getMixin();
