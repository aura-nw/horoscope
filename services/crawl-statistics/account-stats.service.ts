/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { MoleculerDBService, QueryTransactionStatsParams } from '../../types';
import { IAccountInfo, ITransaction } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Context } from 'moleculer';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'account-stats',
    version: 1,
    /**
     * Mixins
     */
    mixins: [dbAccountInfoMixin],
    /**
     * Settings
     */
})
export default class AccountStatsService extends MoleculerDBService<
    {
        rest: 'v1/account-stats';
    },
    IAccountInfo
> {
    @Action({
        name: 'countTotal',
        cache: {
            ttl: 10,
        },
    })
    async countTotal(ctx: Context<any>) {
        let result = await this.adapter.count({
            query: {
                'custom_info.chain_id': ctx.params.chain_id
            }
        });
        return result;
    }
}