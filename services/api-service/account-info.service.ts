import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { Get, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Config } from '../../common';
import {
	CONST_CHAR,
	LIST_NETWORK,
	URL_TYPE_CONSTANTS,
	VESTING_ACCOUNT_TYPE,
} from '../../common/constant';
import { Context } from 'moleculer';
import {
	AccountInfoRequest,
	MoleculerDBService,
	ResponseDto,
	ErrorCode,
	ErrorMessage,
	GetAccountStakeParams,
} from '../../types';
import { Utils } from '../../utils/utils';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { ValidatorEntity } from 'entities';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-info',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [callApiMixin, dbAccountInfoMixin],
	/**
	 * Settings
	 */
})
export default class AccountInfoService extends MoleculerDBService<
	{
		rest: 'v1/account-info';
	},
	{}
> {
	/**
	 *  @swagger
	 *  /v1/account-info:
	 *    get:
	 *      tags:
	 *        - Account Info
	 *      summary: Get information of an address
	 *      description: Get information of an address
	 *      parameters:
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "Address of account"
	 *        - in: query
	 *          name: chainId
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet"
	 *      responses:
	 *        '200':
	 *          description: Account information
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
	 *                      account_auth:
	 *                        type: object
	 *                        properties:
	 *                          result:
	 *                            type: object
	 *                            properties:
	 *                              'type':
	 *                                type: string
	 *                                example: 'cosmos-sdk/BaseAccount'
	 *                              value:
	 *                                type: object
	 *                                properties:
	 *                                  address:
	 *                                    type: string
	 *                                    example: 'aura123123123123123123'
	 *                                  public_key:
	 *                                    type: object
	 *                                    properties:
	 *                                      'type':
	 *                                        type: string
	 *                                        example: 'tendermint/PubKeySecp256k1'
	 *                                      value:
	 *                                        type: string
	 *                                        example: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
	 *                                  account_number:
	 *                                    type: string
	 *                                    example: '10'
	 *                                  sequence:
	 *                                    type: string
	 *                                    example: '10'
	 *                          height:
	 *                            type: string
	 *                            example: '100'
	 *                      address:
	 *                        type: string
	 *                        example: 'aura123123123123123123123'
	 *                      account_balances:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            denom:
	 *                              type: string
	 *                              example: 'aura'
	 *                            amount:
	 *                              type: string
	 *                              example: '10000000'
	 *                      account_delegations:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            delegations:
	 *                              type: object
	 *                              properties:
	 *                                delegator_address:
	 *                                  type: string
	 *                                  example: 'aura123123123123123123'
	 *                                validator_address:
	 *                                  type: string
	 *                                  example: 'auravaloper123123123123'
	 *                                shares:
	 *                                  type: string
	 *                                  example: '100000'
	 *                            balance:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '1000000'
	 *                      account_redelegations:
	 *                        type: object
	 *                        properties:
	 *                          redelegation:
	 *                            type: object
	 *                            properties:
	 *                              delegator_address:
	 *                                type: string
	 *                                example: 'aura123123123123123123123'
	 *                              validator_src_address:
	 *                                type: string
	 *                                example: 'auravaloper123123123123123'
	 *                              validator_dst_address:
	 *                                type: string
	 *                                example: 'auravaloper123123123123123'
	 *                          entries:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                redelegation_entry:
	 *                                  type: object
	 *                                  properties:
	 *                                    creation_height:
	 *                                      type: string
	 *                                      example: '100000'
	 *                                    completion_time:
	 *                                      type: string
	 *                                      example: '2022-09-13T09:23:48.195Z'
	 *                                    initial_balance:
	 *                                      type: string
	 *                                      example: '1000000'
	 *                                    shares_dst:
	 *                                      type: string
	 *                                      example: '1000000'
	 *                                balance:
	 *                                  type: string
	 *                                  example: '1000000'
	 *                      account_spendable_balances:
	 *                        type: object
	 *                        properties:
	 *                          redelegation:
	 *                            type: object
	 *                            properties:
	 *                              denom:
	 *                                type: string
	 *                                example: 'uaura'
	 *                              amount:
	 *                                type: string
	 *                                example: '10000000000'
	 *                      account_unbonding:
	 *                        type: object
	 *                        properties:
	 *                          delegator_address:
	 *                            type: string
	 *                            example: 'aura123123123123'
	 *                          validator_address:
	 *                            type: string
	 *                            example: 'auravaloper123123123'
	 *                          entries:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                creation_height:
	 *                                  type: string
	 *                                  example: '100000'
	 *                                completion_time:
	 *                                  type: string
	 *                                  example: '2022-09-13T09:23:12.018Z'
	 *                                initial_balance:
	 *                                  type: string
	 *                                  example: '100000000'
	 *                                balance:
	 *                                  type: string
	 *                                  example: '100000000'
	 *                      account_delegate_rewards:
	 *                        type: object
	 *                        properties:
	 *                          rewards:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '100000'
	 *                          total:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '100000'
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
	 *                           example: "v1.block.chain"
	 */
	@Get('/', {
		name: 'getAccountInfo',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			address: 'string',
			chainId: 'string',
		},
	})
	async getAccountInfoByAddress(ctx: Context<AccountInfoRequest>) {
		const paramDelegateRewards =
			Config.GET_PARAMS_DELEGATE_REWARDS + `/${ctx.params.address}/rewards`;
		const url = Utils.getUrlByChainIdAndType(ctx.params.chainId, URL_TYPE_CONSTANTS.LCD);

		let [accountInfo, accountRewards]: [any, any] = await Promise.all([
			this.adapter.findOne({
				address: ctx.params.address,
				'custom_info.chain_id': ctx.params.chainId,
			}),
			this.callApiFromDomain(url, paramDelegateRewards),
		]);

		if (accountInfo) {
			this.broker.call('v1.handleAddress.accountinfoupsert', {
				listTx: [{ address: ctx.params.address, message: '' }],
				source: CONST_CHAR.API,
				chainId: ctx.params.chainId,
			});
			accountInfo = accountInfo.toObject();
			accountInfo.account_delegate_rewards = accountRewards;
			const data = accountInfo;
			const result: ResponseDto = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data,
			};
			this.logger.info(JSON.stringify(result));
			return result;
		} else {
			this.broker.call('v1.handleAddress.accountinfoupsert', {
				listTx: [{ address: ctx.params.address, message: '' }],
				source: CONST_CHAR.API,
				chainId: ctx.params.chainId,
			});
			if (!accountRewards.code) {
				const result: ResponseDto = {
					code: ErrorCode.SUCCESSFUL,
					message: ErrorMessage.CRAWL_SUCCESSFUL,
					data: null,
				};
				return result;
			} else {
				const result: ResponseDto = {
					code: ErrorCode.ADDRESS_NOT_FOUND,
					message: ErrorMessage.ADDRESS_NOT_FOUND,
					data: null,
				};
				return result;
			}
		}
	}

	/**
	 *  @swagger
	 *  /v1/account-info/delegations:
	 *    get:
	 *      tags:
	 *        - Account Info
	 *      summary: Get delegation information of an address
	 *      description: Get delegation information of an address
	 *      parameters:
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "Address of account"
	 *        - in: query
	 *          name: chainId
	 *          required: true
	 *          schema:
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *            type: string
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet"
	 *      responses:
	 *        '200':
	 *          description: Account information
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
	 *                      address:
	 *                        type: string
	 *                        example: 'aura123123123123123123123'
	 *                      account_balances:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            denom:
	 *                              type: string
	 *                              example: 'aura'
	 *                            amount:
	 *                              type: string
	 *                              example: '10000000'
	 *                      account_delegations:
	 *                        type: array
	 *                        items:
	 *                          type: object
	 *                          properties:
	 *                            delegations:
	 *                              type: object
	 *                              properties:
	 *                                delegator_address:
	 *                                  type: string
	 *                                  example: 'aura123123123123123123'
	 *                                validator_address:
	 *                                  type: string
	 *                                  example: 'auravaloper123123123123'
	 *                                shares:
	 *                                  type: string
	 *                                  example: '100000'
	 *                            balance:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '1000000'
	 *                      account_delegate_rewards:
	 *                        type: object
	 *                        properties:
	 *                          rewards:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '100000'
	 *                          total:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                denom:
	 *                                  type: string
	 *                                  example: 'uaura'
	 *                                amount:
	 *                                  type: string
	 *                                  example: '100000'
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
	 *                           example: "v1.block.chain"
	 */
	@Get('/delegations', {
		name: 'getAccountDelegationInfo',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			address: 'string',
			chainId: 'string',
		},
	})
	async getAccountDelegationInfoByAddress(ctx: Context<AccountInfoRequest>) {
		const paramDelegateRewards =
			Config.GET_PARAMS_DELEGATE_REWARDS + `/${ctx.params.address}/rewards`;
		const url = Utils.getUrlByChainIdAndType(ctx.params.chainId, URL_TYPE_CONSTANTS.LCD);

		let [accountInfo, accountRewards]: [any, any] = await Promise.all([
			this.adapter.lean({
				query: {
					address: ctx.params.address,
					'custom_info.chain_id': ctx.params.chainId,
				},
				projection: {
					address: 1,
					account_balances: 1,
					account_delegations: 1,
					custom_info: 1,
				},
			}),
			this.callApiFromDomain(url, paramDelegateRewards),
		]);
		let result: ResponseDto;
		if (accountInfo.length > 0) {
			this.broker.call('v1.handleAddress.accountinfoupsert', {
				listTx: [{ address: ctx.params.address, message: '' }],
				source: CONST_CHAR.API,
				chainId: ctx.params.chainId,
			});
			let data = Object.assign({}, accountInfo[0]);
			data.account_delegate_rewards = accountRewards;
			result = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data,
			};
		} else {
			this.broker.call('v1.handleAddress.accountinfoupsert', {
				listTx: [{ address: ctx.params.address, message: '' }],
				source: CONST_CHAR.API,
				chainId: ctx.params.chainId,
			});
			if (!accountRewards.code) {
				const result: ResponseDto = {
					code: ErrorCode.SUCCESSFUL,
					message: ErrorMessage.CRAWL_SUCCESSFUL,
					data: null,
				};
				return result;
			} else {
				result = {
					code: ErrorCode.ADDRESS_NOT_FOUND,
					message: ErrorMessage.ADDRESS_NOT_FOUND,
					data: null,
				};
			}
		}
		return result;
	}

	/**
	 *  @swagger
	 *  /v1/account-info/stake:
	 *    get:
	 *      tags:
	 *        - Account Info
	 *      summary: Get account stake info
	 *      description: Get account stake info
	 *      parameters:
	 *        - in: query
	 *          name: chainId
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["aura-testnet","serenity-testnet-001","halo-testnet-001","theta-testnet-001","osmo-test-4","evmos_9000-4","euphoria-1","cosmoshub-4"]
	 *          description: "Chain Id of network need to query"
	 *          example: "aura-testnet"
	 *        - in: query
	 *          name: address
	 *          required: true
	 *          schema:
	 *            type: string
	 *          description: "Address need to query"
	 *        - in: query
	 *          name: type
	 *          required: true
	 *          schema:
	 *            type: string
	 *            enum: ["Delegations","Unbondings","Redelegations","Vestings"]
	 *          description: "Type of stake need to query"
	 *        - in: query
	 *          name: limit
	 *          required: true
	 *          schema:
	 *            type: number
	 *            default: 10
	 *          description: Limit number of data returned
	 *        - in: query
	 *          name: offset
	 *          required: true
	 *          schema:
	 *            type: number
	 *            default: 0
	 *          description: Number of data to skip
	 *      responses:
	 *        '200':
	 *          description: Account information
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
	 *                      account_unbonding:
	 *                        type: object
	 *                        properties:
	 *                          delegator_address:
	 *                            type: string
	 *                            example: 'aura123123123123'
	 *                          validator_address:
	 *                            type: string
	 *                            example: 'auravaloper123123123'
	 *                          entries:
	 *                            type: array
	 *                            items:
	 *                              type: object
	 *                              properties:
	 *                                creation_height:
	 *                                  type: string
	 *                                  example: '100000'
	 *                                completion_time:
	 *                                  type: string
	 *                                  example: '2022-09-13T09:23:12.018Z'
	 *                                initial_balance:
	 *                                  type: string
	 *                                  example: '100000000'
	 *                                balance:
	 *                                  type: string
	 *                                  example: '100000000'
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
	 *                           example: "v1.account-info"
	 */
	@Get('/stake', {
		name: 'getAccountStake',
		params: {
			address: { type: 'string', required: true },
			chainId: {
				type: 'string',
				optional: false,
				enum: LIST_NETWORK.map((e) => {
					return e.chainId;
				}),
			},
			type: { type: 'string', required: true },
			limit: {
				type: 'number',
				required: true,
				default: 10,
				integer: true,
				convert: true,
				min: 1,
				max: 100,
			},
			offset: {
				type: 'number',
				required: true,
				default: 0,
				integer: true,
				convert: true,
				min: 0,
				max: 100,
			},
		},
	})
	async getAccountStake(ctx: Context<GetAccountStakeParams, Record<string, unknown>>) {
		let projection: any = [
			{
				$match: {
					address: ctx.params.address,
					'custom_info.chain_id': ctx.params.chainId,
				},
			},
		];
		switch (ctx.params.type) {
			case 'Delegations':
				projection.push(...[
					{ $project: { account_delegations: 1 } },
					{ $unwind: '$account_delegations' },
					{ $skip: ctx.params.offset },
					{ $limit: ctx.params.limit },
				]);
				break;
			case 'Unbondings':
				projection.push(...[
					{ $project: { account_unbonding: 1 } },
					{ $unwind: '$account_unbonding' },
					{ $skip: ctx.params.offset },
					{ $limit: ctx.params.limit },
				]);
				break;
			case 'Redelegations':
				projection.push(...[
					{ $project: { account_redelegations: 1 } },
					{ $unwind: '$account_redelegations' },
					{ $skip: ctx.params.offset },
					{ $limit: ctx.params.limit },
				]);
				break;
			case 'Vestings':
				projection.push(...[
					{ $project: { account_auth: 1 } }, { $unwind: '$account_auth' }
				]);
				projection['$project'] = { account_auth: 1 };
				break;
		}

		let data = await this.adapter.aggregate(projection);
		if (ctx.params.type === 'Unbondings') {
			let validators: any = await this.broker.call(
				'v1.validator.find',
				{
					query: {
						'custom_info.chain_id': ctx.params.chainId,
					},
				},
			);
			data.map((unbond: any) => {
				let validator = validators.find((val: ValidatorEntity) =>
					val.operator_address === unbond.account_unbonding.validator_address
				);
				unbond.account_unbonding.validator_description = {
					description: validator.description,
					jailed: validator.jailed,
				};
			});
		}
		let response = {
			code: ErrorCode.SUCCESSFUL,
			message: ErrorMessage.SUCCESSFUL,
			data,
		};
		return response;
	}
}
