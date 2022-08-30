import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { Get, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Config } from '../../common';
import { CONST_CHAR, URL_TYPE_CONSTANTS, VESTING_ACCOUNT_TYPE } from '../../common/constant';
import { Context } from 'moleculer';
import {
	AccountInfoRequest,
	MoleculerDBService,
	ResponseDto,
	ErrorCode,
	ErrorMessage,
} from '../../types';
import { Utils } from '../../utils/utils';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-info',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [callApiMixin],
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
	 *      responses:
	 *        '200':
	 *          description: Register result
	 *        '422':
	 *          description: Missing parameters
	 *
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
		const paramBalances = 
			Config.GET_PARAMS_BALANCE + `/${ctx.params.address}`;
		const paramSpendableBalances = 
			Config.GET_PARAMS_SPENDABLE_BALANCE + `/${ctx.params.address}`;
		const paramDelegateRewards =
			Config.GET_PARAMS_DELEGATE_REWARDS + `/${ctx.params.address}/rewards`;
		const paramAuth = Config.GET_PARAMS_AUTH_INFO + `/${ctx.params.address}`;
		const url = Utils.getUrlByChainIdAndType(ctx.params.chainId, URL_TYPE_CONSTANTS.LCD);

		let [
			accountAuth,
			accountBalances,
			accountDelegations,
			accountRedelegations,
			accountSpendableBalances,
			accountUnbonds,
			accountRewards,
		]
		: [any, any, any, any, any, any, any] = await Promise.all([
			this.callApiFromDomain(url, paramAuth),
			this.broker.call('v1.account-balances.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.broker.call('v1.account-delegations.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.broker.call('v1.account-redelegations.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.broker.call('v1.account-spendable-balances.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.broker.call('v1.account-unbonds.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.callApiFromDomain(url, paramDelegateRewards),
		]);
		if (accountAuth.result.type === VESTING_ACCOUNT_TYPE.CONTINUOUS || accountAuth.result.type === VESTING_ACCOUNT_TYPE.PERIODIC) {
			[accountBalances, accountSpendableBalances] = await Promise.all([
				this.callApiFromDomain(url, paramBalances),
				this.callApiFromDomain(url, paramSpendableBalances)
			]);
			accountBalances = {
				balances: accountBalances.balances
			};
			accountSpendableBalances = {
				spendable_balances: accountSpendableBalances.balances
			};
		}

		if (accountDelegations) {
			const data = {
				account_balances: accountBalances,
				account_delegations: accountDelegations,
				account_redelegations: accountRedelegations,
				account_spendable_balances: accountSpendableBalances,
				account_unbonds: accountUnbonds.data,
				account_auth: accountAuth,
				account_delegate_rewards: accountRewards,
			};
			const result: ResponseDto = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data,
			};
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
	 *      responses:
	 *        '200':
	 *          description: OK
	 *        '422':
	 *          description: Missing parameters
	 *
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

		const [accountBalances, accountDelegations, accountRewards] = await Promise.all([
			this.broker.call('v1.account-balances.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.broker.call('v1.account-delegations.getByAddress', {
				address: ctx.params.address,
				chainid: ctx.params.chainId,
			}),
			this.callApiFromDomain(url, paramDelegateRewards),
		]);
		if (accountBalances) {
			const data = {
				account_balances: accountBalances,
				account_delegations: accountDelegations,
				account_delegate_rewards: accountRewards,
			};
			const result: ResponseDto = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data,
			};
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
}
