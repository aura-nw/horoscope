import { Method } from '@ourparentcenter/moleculer-decorators-extended';
import { RedisClientType } from '@redis/client';
import { defaultMaxListeners } from 'events';
import { Context, Service, ServiceBroker, ServiceSchema } from 'moleculer';
import { Config } from '../../common';
// const redis = require('redis');
import { createClient } from 'redis';

export default class RedisMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor() {
		this.schema = {
			methods: {
				async getRedisClient() {
					if (this.redisClient === undefined) {
						this.redisClient = createClient({
							username: Config.REDIS_USERNAME,
							password: Config.REDIS_PASSWORD,
							socket: {
								host: Config.REDIS_HOST,
								port: Config.REDIS_PORT,
							},
							database: Config.REDIS_DB_NUMBER,
							// url: `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
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

export const redisMixin = new RedisMixin().start();
