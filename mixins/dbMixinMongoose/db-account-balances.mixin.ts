'use strict';

import { Config } from "../../common";
import { accountBalancesMongoModel } from "../../model/account-balances.model";
import { DbBaseMixin } from "./db-base.mixin";

const dbInfo = Config.DB_ACCOUNT_BALANCES;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountBalancesMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountBalancesMongoModel(dbInfo.collection),
});

export const dbAccountBalancesMixin = dbBaseMixin.getMixin();