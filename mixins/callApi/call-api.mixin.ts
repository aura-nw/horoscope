import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { Axios } from 'axios';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
const axios = require('axios').default;
const Resilient = require('resilient');
import { Config } from '../../common';

export default class CallApiMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;
	public constructor() {
		this.schema = {
			settings: {
				rpcUrl: Config.RPC_URL,
				enableLoadBalancer: Config.ENABLE_LOADBALANCER,
				listRpcUrl: JSON.parse(Config.LIST_RPC_URL),
			},
			methods: {
				async callApi(url: string) {
					if (this.callApiClient === undefined) {
						let rpcUrl = this.settings.rpcUrl;
						let enableLoadBalancer = this.settings.enableLoadBalancer;
						let listRpcUrl = this.settings.listRpcUrl;

						if (enableLoadBalancer === 'false') {
							axios.baseURL = rpcUrl;
							let axiosClient = axios.create({
								baseURL: rpcUrl,
							});
							this.callApiClient = axiosClient;
						} else {
							let resilientClient = Resilient({ service: { basePath: '/' } });
							resilientClient.setServers(listRpcUrl);
							this.callApiClient = resilientClient;
						}
					}
					// @ts-ignore
					let result = await this.callApiClient.get(url);
					return result.data;
				},
			},
		};
	}

	public start() {
		return this.schema;
	}
}
