/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Context } from 'moleculer';
import { JsonConvert } from 'json2typescript';
import { MoleculerDBService, QueryDelayJobParams, QueryPendingDelayJobParams } from '../../types';
import { DelayJobEntity, IDelayJob } from '../../entities';
import { dbDelayJobMixin } from '../../mixins/dbMixinMongoose';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'delay-job',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbDelayJobMixin],
	/**
	 * Settings
	 */
})
export default class DelayJobService extends MoleculerDBService<
	{
		rest: 'v1/delay-job';
	},
	IDelayJob
> {
	@Action({
		name: 'findOne',
		cache: {
			ttl: 10,
		},
	})
	async findOne(ctx: Context<QueryDelayJobParams>) {
		const result = await this.adapter.findOne({
			'content.address': ctx.params.address,
			// eslint-disable-next-line quote-props
			type: ctx.params.type,
			'custom_info.chain_id': ctx.params.chain_id,
		});
		return result;
	}

	@Action({
		name: 'findPendingJobs',
		cache: {
			ttl: 10,
		},
	})
	async findPendingJobs(ctx: Context<QueryPendingDelayJobParams>) {
		const result = await this.adapter.find({
			query: {
				'custom_info.chain_id': ctx.params.chain_id,
			},
		});
		return result;
	}

	@Action({
		name: 'addNewJob',
		cache: {
			ttl: 10,
		},
	})
	async addNewJob(ctx: Context<any>) {
		const delayJob = {} as DelayJobEntity;
		delayJob.content = ctx.params.content;
		delayJob.type = ctx.params.type;
		// eslint-disable-next-line camelcase
		delayJob.expire_time = ctx.params.expire_time;
		delayJob.indexes = ctx.params.indexes;
		// eslint-disable-next-line camelcase
		delayJob.custom_info = ctx.params.custom_info;
		const item: DelayJobEntity = new JsonConvert().deserializeObject(delayJob, DelayJobEntity);
		const result = await this.adapter.insert(item);
		return result;
	}

	@Action({
		name: 'updateJob',
		cache: {
			ttl: 10,
		},
	})
	async updateJob(ctx: Context<any>) {
		// eslint-disable-next-line no-underscore-dangle
		const result = await this.adapter.updateById(ctx.params._id, ctx.params.update);
		return result;
	}

	@Action({
		name: 'deleteFinishedJob',
		cache: {
			ttl: 10,
		},
	})
	async deleteFinishedJob(ctx: Context<any>) {
		// eslint-disable-next-line no-underscore-dangle
		const result = await this.adapter.removeById(ctx.params._id);
		return result;
	}
}
