/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Context } from 'moleculer';
import { JsonConvert } from 'json2typescript';
import { MoleculerDBService, QueryDelayJobParams } from '../../types';
import { DelayJobEntity, IDelayJob } from '../../entities';
import { dbDelayJobMixin } from '../../mixins/dbMixinMongoose';
import { LIST_NETWORK } from '../../common/constant';

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
	@Action()
	async findOne(ctx: Context<QueryDelayJobParams>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const result = await this.adapter.findOne({
			'content.address': ctx.params.address,
			type: ctx.params.type,
		});
		return result;
	}

	@Action()
	async findPendingJobs(ctx: Context<any>) {
		const result = [];
		let done = false;
		let offset = 0;
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		while (!done) {
			const jobs = await this.adapter.find({
				// @ts-ignore
				sort: 'expire_time',
				limit: 100,
				offset,
			});
			if (jobs.length > 0) {
				result.push(...jobs);
				offset += 100;
			} else {
				done = true;
			}
			if (result.length >= 1000) {
				done = true;
			}
		}
		return result;
	}

	@Action()
	async addNewJob(ctx: Context<any>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		const delayJob = {} as DelayJobEntity;
		delayJob.content = ctx.params.content;
		delayJob.type = ctx.params.type;
		// eslint-disable-next-line camelcase
		delayJob.expire_time = ctx.params.expire_time;
		// eslint-disable-next-line camelcase
		delayJob.custom_info = ctx.params.custom_info;
		const item: DelayJobEntity = new JsonConvert().deserializeObject(delayJob, DelayJobEntity);
		const result = await this.adapter.insert(item);
		return result;
	}

	@Action()
	async updateJob(ctx: Context<any>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		// eslint-disable-next-line no-underscore-dangle
		const result = await this.adapter.updateById(ctx.params._id, ctx.params.update);
		return result;
	}

	@Action()
	async deleteFinishedJob(ctx: Context<any>) {
		const network = LIST_NETWORK.find((x) => x.chainId === ctx.params.chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		// eslint-disable-next-line no-underscore-dangle
		const result = await this.adapter.removeById(ctx.params._id);
		return result;
	}
}
