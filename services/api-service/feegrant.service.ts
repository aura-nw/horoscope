/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context } from 'moleculer';
import { Put, Method, Service, Get, Action } from '@ourparentcenter/moleculer-decorators-extended';
import { Config } from '../../common';
import {
    ErrorCode,
    ErrorMessage,
    GetAccountUnbondRequest,
    getActionConfig,
    MoleculerDBService,
    RestOptions,
} from '../../types';
import { DbContextParameters } from 'moleculer-db';
import { LIST_NETWORK } from '../../common/constant';
import { dbAccountInfoMixin, dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { IAccountInfo } from 'entities';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { mongoDBMixin } from '../../mixins/dbMixinMongoDB/mongodb.mixin';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'feegrant',
    version: 1,
    /**
     * Mixins
     */
    mixins: [callApiMixin, dbFeegrantHistoryMixin],
    /**
     * Settings
     */
})
export default class AccountUnbondsService extends MoleculerDBService<
    {
        rest: 'v1/accountunbonds';
    },
    IAccountInfo
> {
    @Get('/', {
        name: 'getByAddress',
        params: {
            address: { type: 'string', required: true },
            chainid: {
                type: 'string',
                optional: false,
                enum: LIST_NETWORK.map((e) => {
                    return e.chainId;
                }),
            },
        },
    })
    async getByAddress(ctx: Context<GetAccountUnbondRequest, Record<string, unknown>>) {
        this.mongoDBClient = await this.connectToDB();
        const db = this.mongoDBClient.db(Config.DB_GENERIC_DBNAME);
        let accountInfoCollection = await db.collection('account_info');

        let data = await accountInfoCollection.findOne(
            {
                address: ctx.params.address,
                'custom_info.chain_id': ctx.params.chainid,
            },
            {
                projection: { address: 1, account_unbonding: 1, custom_info: 1 },
            },
        );
        let response = {
            code: ErrorCode.SUCCESSFUL,
            message: ErrorMessage.SUCCESSFUL,
            data,
        };
        return response;
    }
}
