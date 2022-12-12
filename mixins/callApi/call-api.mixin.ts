import { Service, ServiceSchema } from 'moleculer';
import axios from 'axios';
import { Config } from '../../common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const resilient = require('resilient');
export default class CallApiMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private _schema: Partial<ServiceSchema> & ThisType<Service>;
	public constructor() {
		// eslint-disable-next-line no-underscore-dangle
		this._schema = {
			settings: {
				enableLoadBalancer: Config.ENABLE_LOADBALANCER,
			},
			methods: {
				async callApiFromDomain(domain: string[], path: string, retry = Infinity) {
					let callApiClient = null;
					if (this.settings.enableLoadBalancer === 'false') {
						const axiosClient = axios.create({
							baseURL: domain[0],
						});
						callApiClient = axiosClient;
					} else {
						const resilientClient = resilient({
							service: { basePath: '/', retry },
						});
						resilientClient.setServers(domain);
						callApiClient = resilientClient;
					}
					try {
						const result = await callApiClient.get(path);
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

				async callApiWithAxios(domain: string, path: string) {
					const callApiClient = axios.create({
						baseURL: domain,
					});
					try {
						const result = await callApiClient.get(path);
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
		// eslint-disable-next-line no-underscore-dangle
		return this._schema;
	}
}

export const callApiMixin = new CallApiMixin().start();
