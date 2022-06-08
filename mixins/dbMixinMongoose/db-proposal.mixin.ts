'use strict';

import { proposalMongoModel } from '../../model';
import { Model } from 'mongoose';
import { Config } from '../../common';
import { DbBaseMixin } from './db-base.mixin';

const dbInfo = Config.DB_PROPOSAL;

const dbBaseMixin = new DbBaseMixin({
	dbInfo,
	name: 'dbProposalMixin',
	collection: dbInfo.collection,
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	model: proposalMongoModel(dbInfo.collection),
});

export const dbProposalMixin = dbBaseMixin.getMixin();
