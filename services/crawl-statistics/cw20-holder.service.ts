/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { MoleculerDBService } from '../../types';
import { dbCW20AssetMixin } from '../../mixins/dbMixinMongoose';
import { Context } from 'moleculer';
import { ICW20Asset } from '../../model';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'cw20-holder',
    version: 1,
    /**
     * Mixins
     */
    mixins: [dbCW20AssetMixin],
    /**
     * Settings
     */
})
export default class Cw20HolderService extends MoleculerDBService<
    {
        rest: 'v1/cw20-holder';
    },
    ICW20Asset
> {
    @Action({
        name: 'act-group-count',
        cache: {
            ttl: 10,
        },
    })
    async groupAndCount(ctx: Context) {
        let result = await this.adapter.aggregate([
            {
                $group: {
                    _id: {
                        code_id: '$code_id',
                        contract_address: '$contract_address'
                    },
                    total_holders: { $sum: 1 }
                }
            }
        ]);
        return result;
    }
}