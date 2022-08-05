import { Service, ServiceSchema } from 'moleculer';
const axios = require('axios').default;
const Resilient = require('resilient');
import { Config } from '../../common';
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
						let resilientClient = Resilient({
							service: { basePath: '/', retry: Infinity },
						});
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
