import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { callApiMixin } from '../../mixins/callApi/call-api.mixin';
import { Get, Service } from '@ourparentcenter/moleculer-decorators-extended';
import { Config } from '../../common';
import { CONST_CHAR, URL_TYPE_CONSTANTS } from '../../common/constant';
import { AccountInfoEntity, IAccountInfo } from '../../entities/account-info.entity';
import { Context } from 'moleculer';
import {
	AccountInfoRequest,
	MoleculerDBService,
	ResponseDto,
	ErrorCode,
	ErrorMessage,
} from '../../types';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
@Service({
	name: 'account-info',
	version: 1,
	/**
	 * Mixins
	 */
	mixins: [dbAccountInfoMixin, callApiMixin],
	/**
	 * Settings
	 */
	// settings: {
	// 	idField: '_id',
	// 	// Available fields in the responses
	// 	fields: ['_id', 'name', 'quantity', 'price'],
	// 	rest: '/v1/products',
	// },
})
export default class AccountInfoService extends MoleculerDBService<
	{
		rest: 'v1/account-info';
	},
	IAccountInfo
> {
	@Get('/:address', {
		name: 'getAccountInfo',
		/**
		 * Service guard services allowed to connect
		 */
		restricted: ['api'],
		params: {
			address: 'string',
		},
	})
	async getAccountInfoByAddress(ctx: Context<AccountInfoRequest>) {
		const paramDelegateRewards =
			Config.GET_PARAMS_DELEGATE_REWARDS + `/${ctx.params.address}/rewards`;
		const [accountInfo, accountRewards] = await Promise.all([
			this.adapter.findOne({ address: ctx.params.address }),
			this.callApi(URL_TYPE_CONSTANTS.LCD, paramDelegateRewards),
		]);
		if (accountInfo) {
			const data = {
				account_info: accountInfo,
				delegate_rewards: accountRewards,
			};
			const result: ResponseDto = {
				code: ErrorCode.SUCCESSFUL,
				message: ErrorMessage.SUCCESSFUL,
				data,
			};
			return result;
		} else {
            let account: AccountInfoEntity[] = await this.broker.call('v1.crawlAccountInfo.accountinfoupsert', { listTx: [{ address: ctx.params.address, message: '' }], source: CONST_CHAR.API });
            this.logger.info('account', account)
			if(account.length > 0) {
                const data = {
                    account_info: account[0],
                    delegate_rewards: accountRewards,
                };
                const result: ResponseDto = {
                    code: ErrorCode.SUCCESSFUL,
                    message: ErrorMessage.SUCCESSFUL,
                    data,
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
