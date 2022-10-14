'use strict';

import { feegrantMongoModel } from '../../model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_FEEGRANT_HISTORY;

const dbBaseMixin = new DbBaseMixin({
    dbInfo,
    name: 'dbFeegrantHistoryMixin',
    collection: dbInfo.collection,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    model: feegrantMongoModel(dbInfo.collection),
});

const dbInfo_2 = Config.DB_FEEGRANT;

const dbBaseMixin_2 = new DbBaseMixin({
    dbInfo_2,
    name: 'dbFeegrantMixin',
    collection: dbInfo_2.collection,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    model: feegrantMongoModel(dbInfo_2.collection),
});

export const dbFeegrantMixin = dbBaseMixin_2.getMixin();
export const dbFeegrantHistoryMixin = dbBaseMixin.getMixin();
