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
				async callApiFromDomain(domain: string[], path: string, retry: Number = Infinity) {
					let callApiClient = null;
					if (this.settings.enableLoadBalancer === 'false') {
						let axiosClient = axios.create({
							baseURL: domain[0],
						});
						callApiClient = axiosClient;
					} else {
						let resilientClient = Resilient({
							service: { basePath: '/', retry: retry },
						});
						resilientClient.setServers(domain);
						callApiClient = resilientClient;
					}
					try {
						let result = await callApiClient.get(path);
						if (result.data) {
							return result.data;
						} else {
							return null;
						}
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
