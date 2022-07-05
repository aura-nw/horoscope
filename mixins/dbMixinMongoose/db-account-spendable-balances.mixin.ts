'use strict';

import { Config } from "../../common";
import { accountSpendableBalancesMongoModel } from "../../model/account-spendable-balances.model";
import { DbBaseMixin } from "./db-base.mixin";

const dbInfo = Config.DB_ACCOUNT_SPENDABLE_BALANCES;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbAccountSpendableBalancesMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountSpendableBalancesMongoModel(dbInfo.collection),
});

export const dbAccountSpendableBalancesMixin = dbBaseMixin.getMixin();