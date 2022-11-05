/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Get, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { ObjectId } from 'bson';
import { IFeegrant } from 'entities';
import { Context } from 'moleculer';
import { QueryOptions } from 'moleculer-db';
import { Config } from '../../common';
import { FEEGRANT_STATUS, LIST_NETWORK } from '../../common/constant';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantMixin } from '../../mixins/dbMixinMongoose';
import {
    ErrorCode,
    ErrorMessage, GetFeegrantRequest,
    MoleculerDBService,
    ResponseDto
} from '../../types';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
    name: 'feegrant',
    version: 1,
    /**
     * Mixins
     */
    mixins: [callApiMixin, dbFeegrantMixin],
    /**
     * Settings
     */
})
export default class FeegrantService extends MoleculerDBService<
    {
        rest: 'v1/feegrant';
    },
    IFeegrant
> {
    @Get('/get-grants', {
        name: 'getGrants',
        params: {
            chainid: {
                type: 'string',
                optional: false,
                enum: LIST_NETWORK.map((e) => {
                    return e.chainId;
                }),
            },
            granter: { type: 'string', optional: true },
            grantee: { type: 'string', optional: true },
            status: {
                type: 'string',
                optional: true,
                default: FEEGRANT_STATUS.AVAILABLE,
                enum: Object.values(FEEGRANT_STATUS),
            },
            expired: {
                type: 'boolean',
                optional: true,
                default: false,
                convert: true,
            },
            pageLimit: {
                type: 'number',
                optional: true,
                default: 10,
                integer: true,
                convert: true,
                min: 1,
                max: 100,
            },
            pageOffset: {
                type: 'number',
                optional: true,
                default: 0,
                integer: true,
                convert: true,
                min: 0,
                max: 100,
            },
            nextKey: {
                type: 'string',
                optional: true,
                default: null,
            },
        },
    })
    async getGrants(ctx: Context<GetFeegrantRequest, Record<string, unknown>>) {
        let response: ResponseDto = {} as ResponseDto;
        if (ctx.params.nextKey) {
            try {
                new ObjectId(ctx.params.nextKey);
            } catch (error) {
                return (response = {
                    code: ErrorCode.WRONG,
                    message: ErrorMessage.VALIDATION_ERROR,
                    data: {
                        message: 'The nextKey is not a valid ObjectId',
                    },
                });
            }
        }
        try {
            let query: QueryOptions = {};
            const network = LIST_NETWORK.find((x) => x.chainId == ctx.params.chainid);
            if (network && network.databaseName) {
                this.adapter.useDb(network.databaseName);
            }
            if (ctx.params.nextKey) {
                if (ctx.params.reverse) {
                    query._id = { $gt: new ObjectId(ctx.params.nextKey) };
                } else {
                    query._id = { $lt: new ObjectId(ctx.params.nextKey) };
                }
                ctx.params.pageOffset = 0;
                ctx.params.countTotal = false;
            }
            if (ctx.params.granter) {
                query["granter"] = ctx.params.granter
            }
            if (ctx.params.grantee) {
                query["grantee"] = ctx.params.grantee
            }
            query["status"] = ctx.params.status
            query["expired"] = ctx.params.expired
            this.logger.info(query)
            let [result, count]: [any[], number] = await Promise.all([
                this.adapter.lean({
                    query: query,
                    limit: ctx.params.pageLimit,
                    offset: ctx.params.pageOffset,
                    // @ts-ignore
                    sort: '-timestamp',
                }),
                this.adapter.count({
                    query: query,
                }),
            ]);
            response = {
                code: ErrorCode.SUCCESSFUL,
                message: ErrorMessage.SUCCESSFUL,
                data: {
                    grants: result,
                    count: count,
                    nextKey: result.length ? result[result.length - 1]._id : null,
                },
            };
        } catch (error) {
            response = {
                code: ErrorCode.WRONG,
                message: ErrorMessage.WRONG,
                data: {
                    error,
                },
            };
        }

        return response;
    }
}
/**
     *  @swagger
     *  /v1/feegrant/get-grants:
     *    get:
     *      tags:
     *        - Feegrant
     *      summary: Get list feegrant with condition
     *      description: Get list feegrant with condition
     *      parameters:
     *        - in: query
     *          name: chainid
     *          required: true
     *          schema:
     *            type: string
     *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
     *          description: "Chain Id of network need to query"
     *          example: "aura-testnet"
     *        - in: query
     *          name: granter
     *          required: false
     *          schema:
     *            type: string
     *          description: "Granter of feegrant"
     *        - in: query
     *          name: grantee
     *          required: false
     *          schema:
     *            type: string
     *          description: "Grantee of feegrant"
     *        - in: query
     *          name: status
     *          required: false
     *          schema:
     *            type: string
     *            enum: ["Available", "Use up", "Revoked", "Fail"]
     *          description: "Status of feegrant"
     *        - in: query
     *          name: expired
     *          required: false
     *          schema:
     *            type: boolean
     *            default: false
     *          description: "Expire status of feegrant"
     *        - in: query
     *          name: pageOffset
     *          required: false
     *          schema:
     *            type: number
     *            default: 0
     *          description: "Page number, start at 0"
     *        - in: query
     *          name: pageLimit
     *          required: false
     *          schema:
     *            type: number
     *            default: 10
     *          description: "number record return in a page"
     *        - in: query
     *          name: nextKey
     *          required: false
     *          schema:
     *            type: string
     *          description: "key for next page"
     *      responses:
     *        '200':
     *          description: List feegrant
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  code:
     *                    type: number
     *                    example: 200
     *                  message:
     *                    type: string
     *                    example: "Successful"
     *                  data:
     *                    type: object
     *                    properties:
     *                      grants:
     *                        type: array
     *                        items:
     *                          type: object
     *                          properties:
     *                            _id:
     *                              type: string
     *                              example: '6350f029e5f359bddeadcb08'
     *                            custom_info:
     *                              type: object
     *                              properties:
     *                                  chain_id:
     *                                      type: string
     *                                      example: 'euphoria-1'
     *                                  chain_name:
     *                                      type: string
     *                                      example: 'Aura Euphoria'
     *                            action:
     *                              type: string
     *                              example: 'create'
     *                            granter:
     *                              type: string
     *                              example: '*************'
     *                            grantee:
     *                              type: string
     *                              example: '*************'
     *                            result:
     *                              type: boolean
     *                              example: true
     *                            timestamp:
     *                              type: string
     *                              example: '2022-10-20T14:18:41.000Z'
     *                            tx_hash:
     *                              type: string
     *                              example: '*************'
     *                            type:
     *                              type: string
     *                              example: '/cosmos.feegrant.v1beta1.BasicAllowance'
     *                            status:
     *                              type: string
     *                              example: 'Use up'
     *                            expired:
     *                              type: boolean
     *                              example: false
     *                            origin_feegrant_txhash:
     *                              type: string
     *                              example: '2E5E6067AECE06B6AAA9969BBF5EE7277C12E05B1317176hgfjfghjhfgjhjkhjkjh'
     *                      count:
     *                        type: number
     *                        example: 10
     *                      nextKey:
     *                        type: string
     *                        example: 'abc'
     *        '422':
     *          description: Bad request
     *          content:
     *            application/json:
     *              schema:
     *                type: object
     *                properties:
     *                  name:
     *                    type: string
     *                    example: "ValidationError"
     *                  message:
     *                    type: string
     *                    example: "Parameters validation error!"
     *                  code:
     *                    type: number
     *                    example: 422
     *                  type:
     *                    type: string
     *                    example: "VALIDATION_ERROR"
     *                  data:
     *                    type: array
     *                    items:
     *                       type: object
     *                       properties:
     *                         type:
     *                           type: string
     *                           example: "required"
     *                         message:
     *                           type: string
     *                           example: "The 'chainid' field is required."
     *                         field:
     *                           type: string
     *                           example: chainid
     *                         nodeID:
     *                           type: string
     *                           example: "node1"
     *                         action:
     *                           type: string
     *                           example: "v1.transaction"
     */