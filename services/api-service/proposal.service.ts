/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { dbProposalMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { getActionConfig, MoleculerDBService, RestOptions } from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { IProposal } from '../../entities';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'proposal',
	version: 1,
	mixins: [dbProposalMixin],
})
export default class ProposalService extends MoleculerDBService<
	{
		rest: 'v1/proposal';
	},
	IProposal
> {
	@Get('/', {
		name: 'list123',
		/**
		 * Service guard services allowed to connect
		 */
		params: {},
	})
	async getAccountInfoByAddress(ctx: Context) {
		this.logger.info('here');
	}
}
