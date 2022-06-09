import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { RedisClientType } from '@redis/client';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
import { Config } from '../../common';
const redis = require('redis');

export default class RedisMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor() {
		this.schema = {
			settings: {
				rpcUrl: Config.RPC_URL,
				enableLoadBalancer: Config.ENABLE_LOADBALANCER,
				listRpcUrl: JSON.parse(Config.LIST_RPC_URL),
			},
			methods: {
				async getRedisClient() {
					if (this.redisClient === undefined) {
						this.redisClient = redis.createClient({
							url: `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}`,
						});
						await this.redisClient.connect();
					}
					return <RedisClientType>this.redisClient;
				},
			},
		};
	}

	public start() {
		return this.schema;
	}
}
