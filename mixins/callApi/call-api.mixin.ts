import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { Axios } from 'axios';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
const axios = require('axios').default;
const Resilient = require('resilient');
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
export default class CallApiMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;
	public constructor() {
		this.schema = {
			settings: {
				enableLoadBalancer: Config.ENABLE_LOADBALANCER,
				rpcUrl: Config.RPC_URL,
				listRpcUrl: JSON.parse(Config.LIST_RPC_URL),
				lcdUrl: Config.LCD_URL,
				listLcdUrl: JSON.parse(Config.LIST_LCD_URL),
			},
			methods: {
				async callApi(typeUrl: string, url: string) {
					if (typeUrl === URL_TYPE_CONSTANTS.LCD) {
						return this.callApiLcd(url);
					}
					return this.callApiRpc(url);
				},
				async callApiRpc(url: string) {
					if (this.callRpcClient === undefined) {
						if (this.settings.enableLoadBalancer === 'false') {
							let axiosClient = axios.create({
								baseURL: this.settings.rpcUrl,
							});
							this.callRpcClient = axiosClient;
						} else {
							let resilientClient = Resilient({
								service: { basePath: '/', retry: 3 },
							});
							resilientClient.setServers(this.settings.listRpcUrl);
							this.callRpcClient = resilientClient;
						}
					}
					try {
						// @ts-ignore
						let result = await this.callRpcClient.get(url);
						return result.data;
					} catch (error) {
						this.logger.error(error);
						this.logger.error(url);
						return null;
					}
				},
				async callApiLcd(url: string) {
					if (this.callLcdClient === undefined) {
						if (this.settings.enableLoadBalancer === 'false') {
							let axiosClient = axios.create({
								baseURL: this.settings.lcdUrl,
							});
							this.callLcdClient = axiosClient;
						} else {
							let resilientClient = Resilient({ service: { basePath: '/' } });
							resilientClient.setServers(this.settings.listLcdUrl);
							this.callLcdClient = resilientClient;
						}
					}
					try {
						// @ts-ignore
						let result = await this.callLcdClient.get(url);
						return result.data;
					} catch (error) {
						this.logger.error(error);
						return null;
					}
				},
			},
		};
	}

	public start() {
		return this.schema;
	}
}
