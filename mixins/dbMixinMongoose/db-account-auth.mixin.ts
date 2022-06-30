'use strict';

import { Config } from "../../common";
import { accountAuthMongoModel } from "../../model/account-auth.model";
import { DbBaseMixin } from "./db-base.mixin";

const dbInfo = Config.DB_ACCOUNT_AUTH;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountAuthMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountAuthMongoModel(dbInfo.collection),
});

export const dbAccountAuthMixin = dbBaseMixin.getMixin();