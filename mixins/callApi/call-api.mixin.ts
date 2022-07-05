import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { Axios } from 'axios';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
const axios = require('axios').default;
const Resilient = require('resilient');

// import { Resilient as Resilient } from 'resilient';
import { Config } from '../../common';
import { LIST_NETWORK, URL_TYPE_CONSTANTS } from '../../common/constant';
export default class CallApiMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;
	public constructor() {
		this.schema = {
			settings: {
				enableLoadBalancer: Config.ENABLE_LOADBALANCER,
			},
			methods: {
				async callApiFromDomain(domain: string[], path: string) {
					let callApiClient = null;
					if (this.settings.enableLoadBalancer === 'false') {
						let axiosClient = axios.create({
							baseURL: domain[0],
						});
						callApiClient = axiosClient;
					} else {
						let resilientClient = Resilient({ service: { basePath: '/' } });
						resilientClient.setServers(domain);
						callApiClient = resilientClient;
					}
					try {
						let result = await callApiClient.get(path);
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

export const callApiMixin = new CallApiMixin().start();
