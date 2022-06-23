'use strict';

import CallApiMixin from "@Mixins/callApi/call-api.mixin";
import { Config } from "../../common";
import { DbBaseMixin } from "./db-base.mixin";
import { accountInfoMongoModel } from '../../model';

const dbInfo = Config.DB_ACCOUNT_INFO;

const dbBaseMixin = new DbBaseMixin({
    dbInfo,
    name: 'dbAccountInfoMixin',
    collection: dbInfo.collection,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: accountInfoMongoModel(dbInfo.collection),
});

export const dbAccountInfoMixin = dbBaseMixin.getMixin();
export const callApiMixin = new CallApiMixin().start();