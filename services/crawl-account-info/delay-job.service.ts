/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { MoleculerDBService, QueryDelayJobParams, QueryPendingDelayJobParams } from '../../types';
import { DelayJobEntity, IDelayJob } from '../../entities';
import { dbDelayJobMixin } from '../../mixins/dbMixinMongoose';
import { Context } from 'moleculer';
import { JsonConvert } from 'json2typescript';

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
		let result = await this.adapter.findOne({
			'content.address': ctx.params.address,
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
		let result = await this.adapter.find({
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
		let delay_job = {} as DelayJobEntity;
		delay_job.content = ctx.params.content;
		delay_job.type = ctx.params.type;
		delay_job.expire_time = ctx.params.expire_time;
		delay_job.indexes = ctx.params.indexes;
		delay_job.custom_info = ctx.params.custom_info;
		const item: DelayJobEntity = new JsonConvert().deserializeObject(delay_job, DelayJobEntity);
		let result = await this.adapter.insert(item);
		return result;
	}

	@Action({
		name: 'updateJob',
		cache: {
			ttl: 10,
		},
	})
	async updateJob(ctx: Context<any>) {
		let result = await this.adapter.updateById(ctx.params._id, ctx.params.update);
		return result;
	}

	@Action({
		name: 'deleteFinishedJob',
		cache: {
			ttl: 10,
		},
	})
	async deleteFinishedJob(ctx: Context<any>) {
		let result = await this.adapter.removeById(ctx.params._id);
		return result;
	}
}
