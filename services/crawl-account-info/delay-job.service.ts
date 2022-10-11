/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
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
                status: ctx.params.status,
                'custom_info.chain_id': ctx.params.chain_id,
            }
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
        const item: DelayJobEntity = new JsonConvert().deserializeObject(
            delay_job,
            DelayJobEntity,
        );
        item.content = ctx.params.content;
        item.type = ctx.params.type;
        item.expire_time = ctx.params.expire_time;
        item.status = ctx.params.status;
        item.custom_info = ctx.params.custom_info;
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
        let result = await this.adapter.updateById(
            ctx.params._id,
            ctx.params.update
        );
        return result;
    }
}