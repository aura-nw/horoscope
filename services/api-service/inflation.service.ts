/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { dbInflationMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { MoleculerDBService, RestOptions } from '../../types';
import { IInflation } from 'entities';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'inflation',
	version: 1,
	/**
	 * Service guard token
	 */
	authToken: Config.PRODUCTS_AUTH_TOKEN,
	/**
	 * Mixins
	 */
	mixins: [dbInflationMixin],
	/**
	 * Settings
	 */
	// settings: {
	// 	idField: '_id',
	// 	// Available fields in the responses
	// 	fields: ['_id', 'name', 'quantity', 'price'],
	// 	rest: '/v1/products',
	// },
})
export default class InFlationService extends MoleculerDBService<
	{
		rest: 'v1/inflation';
	},
	IInflation
> {}
