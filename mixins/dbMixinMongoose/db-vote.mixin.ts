'use strict';

import { voteMongoModel } from '../../model/vote.model';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_VOTE;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbVoteMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: voteMongoModel(dbInfo.collection),
	idField: '_id',
});

export const dbVoteMixin = dbBaseMixin.getMixin();
