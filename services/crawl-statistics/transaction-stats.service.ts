/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { MoleculerDBService, QueryPendingDelayJobParams, QueryTransactionStatsParams } from '../../types';
import { ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { Context } from 'moleculer';
import { JsonConvert } from 'json2typescript';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'transaction-stats',
    version: 1,
    /**
     * Mixins
     */
    mixins: [dbTransactionMixin],
    /**
     * Settings
     */
})
export default class TransactionStatsService extends MoleculerDBService<
    {
        rest: 'v1/transaction-stats';
    },
    ITransaction
> {
    @Action({
        name: 'act-find'
    })
    async find(ctx: Context<QueryTransactionStatsParams>) {
        let result = await this.adapter.lean({
            query: ctx.params.query,
            sort: ctx.params.sort,
            limit: ctx.params.limit,
        });
        return result;
    }
}