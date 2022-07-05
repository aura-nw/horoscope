'use strict';

import { Config } from "../../common";
import { accountDelegationsMongoModel } from "../../model/account-delegations.model";
import { DbBaseMixin } from "./db-base.mixin";

const dbInfo = Config.DB_ACCOUNT_DELEGATIONS;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountDelegationsMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountDelegationsMongoModel(dbInfo.collection),
});

export const dbAccountDelegationsMixin = dbBaseMixin.getMixin();