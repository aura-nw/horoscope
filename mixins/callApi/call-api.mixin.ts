import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
const axios = require('axios').default;
const Resilient = require('resilient');
import { Config } from '../../common';

export default class CallApiMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private rpcUrl;
	private enableLoadBalancer;
	private listRpcUrl;
	private callApiClient;
	private schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor() {
		let rpcUrl = Config.RPC_URL;
		let enableLoadBalancer = Config.ENABLE_LOADBALANCER;
		let listRpcUrl = JSON.parse(Config.LIST_RPC_URL);

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

						if (this.enableLoadBalancer === 'false') {
							this.callApiClient = axios;
						} else {
							let resilientClient = Resilient({ service: { basePath: '/' } });
							resilientClient.setServers(this.listRpcUrl);
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
		if (this.enableLoadBalancer === 'false') {
			this.callApiClient = axios;
		} else {
			let resilientClient = Resilient({ service: { basePath: '/' } });
			resilientClient.setServers(this.listRpcUrl);
			this.callApiClient = resilientClient;
		}
		// @ts-ignore
		this.schema.settings.callApiClient = this.callApiClient;
		return this.schema;
	}

	@Method
	async callApi123(url: string) {
		if (this.enableLoadBalancer === 'false') {
			this.callApiClient = axios;
		} else {
			let resilientClient = Resilient({ service: { basePath: '/' } });
			resilientClient.setServers(this.listRpcUrl);
			this.callApiClient = resilientClient;
		}

		let result = await this.callApiClient.get(url);
		return result.data;
	}
}
