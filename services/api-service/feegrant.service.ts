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
            let query: QueryOptions = { 'custom_info.chain_id': ctx.params.chainid };
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
     *            enum: ["Available","Expired", "Use up", "Revoked", "Fail"]
     *          description: "Status of feegrant"
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
     *                      transaction:
     *                        type: object
     *                        properties:
     *                          tx:
     *                            type: object
     *                            properties:
     *                              body:
     *                                type: object
     *                                properties:
     *                                  messages:
     *                                    type: array
     *                                    items:
     *                                      type: object
     *                                      properties:
     *                                        '@type':
     *                                          type: string
     *                                          example: '/cosmos.staking.v1beta1.MsgDelegate'
     *                                        delegator_address:
     *                                          type: string
     *                                          example: 'aura123123123123'
     *                                        validator_address:
     *                                          type: string
     *                                          example: 'aura123123123123'
     *                                  extension_options:
     *                                    type: array
     *                                    items:
     *                                      type: object
     *                                  non_critical_extension_options:
     *                                    type: array
     *                                    items:
     *                                      type: object
     *                                  memo:
     *                                    type: string
     *                                    example: "This is Aura Tx"
     *                                  timeout_height:
     *                                    type: string
     *                                    example: "0"
     *                              auth_info:
     *                                type: object
     *                                properties:
     *                                  fee:
     *                                    type: object
     *                                    properties:
     *                                      amount:
     *                                        type: array
     *                                        items:
     *                                          properties:
     *                                            denom:
     *                                              type: string
     *                                              example: 'uaura'
     *                                            amount:
     *                                              type: string
     *                                              example: '1000000'
     *                                      gas_limit:
     *                                        type: string
     *                                        example: '100000'
     *                                      payer:
     *                                        type: string
     *                                        example: ''
     *                                      granter:
     *                                        type: string
     *                                        example: ''
     *                                  signer_infos:
     *                                    type: array
     *                                    items:
     *                                      type: object
     *                                      properties:
     *                                        mode_info:
     *                                          type: object
     *                                          properties:
     *                                            single:
     *                                              type: object
     *                                              properties:
     *                                                mode:
     *                                                  type: string
     *                                                  example: "SIGN_MODE_DIRECT"
     *                                        public_key:
     *                                          type: object
     *                                          properties:
     *                                            '@type':
     *                                              type: string
     *                                              example: '/cosmos.crypto.secp256k1.PubKey'
     *                                            key:
     *                                              type: string
     *                                              example: 'xxxxxxxxxxxxxxxxxxxx'
     *                                        sequence:
     *                                          type: string
     *                                          example: '1000000'
     *                              signatures:
     *                                type: array
     *                                items:
     *                                  type: string
     *                                  example: 'xxxxxxxxxxxxxxx'
     *                          tx_response:
     *                            type: object
     *                            properties:
     *                              height:
     *                                type: number
     *                                example: 10000
     *                              txhash:
     *                                type: string
     *                                example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
     *                              codespace:
     *                                type: string
     *                                example: ''
     *                              code:
     *                                type: string
     *                                example: '0'
     *                              data:
     *                                type: string
     *                                example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
     *                              raw_log:
     *                                type: string
     *                                example: '[{\"events\":[{\"type\":\"coin_received\",\"attributes\":[{\"key\":\"receiver\",\"value\":\"xxxxx\"}]'
     *                              logs:
     *                                type: array
     *                                items:
     *                                  type: object
     *                                  properties:
     *                                    msg_index:
     *                                      type: number
     *                                      example: 0
     *                                    log:
     *                                      type: string
     *                                      example: ''
     *                                    events:
     *                                      type: array
     *                                      items:
     *                                        type: object
     *                                        properties:
     *                                          'type':
     *                                            type: string
     *                                            example: 'coin_received'
     *                                          attributes:
     *                                            type: array
     *                                            items:
     *                                              type: object
     *                                              properties:
     *                                                key:
     *                                                  type: string
     *                                                  example: receiver
     *                                                value:
     *                                                  type: string
     *                                                  example: 'aura123123123123123'
     *                              info:
     *                                type: string
     *                              gas_wanted:
     *                                type: string
     *                                example: "200000"
     *                              gas_used:
     *                                type: string
     *                                example: "150000"
     *                              tx:
     *                                type: object
     *                                properties:
     *                                  '@type':
     *                                    type: string
     *                                    example: '/cosmos.tx.v1beta1.Tx'
     *                                  body:
     *                                    type: object
     *                                    properties:
     *                                      messages:
     *                                        type: array
     *                                        items:
     *                                          type: object
     *                                          properties:
     *                                            '@type':
     *                                              type: string
     *                                              example: '/cosmos.staking.v1beta1.MsgDelegate'
     *                                            delegator_address:
     *                                              type: string
     *                                              example: 'aura123123123123123'
     *                                            validator_address:
     *                                              type: string
     *                                              example: 'aura123123123123123123'
     *                                      memo:
     *                                        type: string
     *                                      timeout_height:
     *                                        type: string
     *                                        example: '0'
     *                                      extension_options:
     *                                        type: array
     *                                        items:
     *                                          type: object
     *                                      non_critical_extension_options:
     *                                        type: array
     *                                        items:
     *                                          type: object
     *                                  auth_info:
     *                                    type: object
     *                                    properties:
     *                                      fee:
     *                                        type: object
     *                                        properties:
     *                                          amount:
     *                                            type: array
     *                                            items:
     *                                              properties:
     *                                                denom:
     *                                                  type: string
     *                                                  example: 'uaura'
     *                                                amount:
     *                                                  type: string
     *                                                  example: '1000000'
     *                                          gas_limit:
     *                                            type: string
     *                                            example: '100000'
     *                                          payer:
     *                                            type: string
     *                                            example: ''
     *                                          granter:
     *                                            type: string
     *                                            example: ''
     *                                      signer_infos:
     *                                        type: array
     *                                        items:
     *                                          type: object
     *                                          properties:
     *                                            mode_info:
     *                                              type: object
     *                                              properties:
     *                                                single:
     *                                                  type: object
     *                                                  properties:
     *                                                    mode:
     *                                                      type: string
     *                                                      example: "SIGN_MODE_DIRECT"
     *                                            public_key:
     *                                              type: object
     *                                              properties:
     *                                                '@type':
     *                                                  type: string
     *                                                  example: '/cosmos.crypto.secp256k1.PubKey'
     *                                                key:
     *                                                  type: string
     *                                                  example: 'xxxxxxxxxxxxxxxxxxxx'
     *                                            sequence:
     *                                              type: string
     *                                              example: '1000000'
     *                                  signatures:
     *                                    type: array
     *                                    items:
     *                                      type: string
     *                                      example: 'xxxxxxxxxxxxxxx'
     *                              timestamp:
     *                                type: string
     *                                example: '2022-09-13T03:17:45.000Z'
     *                              events:
     *                                type: array
     *                                items:
     *                                  type: object
     *                                  properties:
     *                                    'type':
     *                                      type: string
     *                                      example: 'coin_received'
     *                                    attributes:
     *                                      type: array
     *                                      items:
     *                                        properties:
     *                                          key:
     *                                            type: string
     *                                            example: 'c3BlbmRlcg=='
     *                                          value:
     *                                            type: string
     *                                            example: 'xxxxxxxxxxxxxxxxxxxxxx'
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