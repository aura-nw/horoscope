import { RedisClientType } from '@redis/client';
import { Service, ServiceSchema } from 'moleculer';
import { createClient } from 'redis';
import { Config } from '../../common';

export default class RedisMixin implements Partial<ServiceSchema>, ThisType<Service> {
	private _schema: Partial<ServiceSchema> & ThisType<Service>;

	public constructor() {
		// eslint-disable-next-line no-underscore-dangle
		this._schema = {
			methods: {
				async getRedisClient() {
					if (this.redisClient === undefined) {
						if (Config.REDIS_URI) {
							this.redisClient = createClient({ url: Config.REDIS_URI });
						} else {
							this.redisClient = createClient({
								username: Config.REDIS_USERNAME,
								password: Config.REDIS_PASSWORD,
								socket: {
									host: Config.REDIS_HOST,
									port: Config.REDIS_PORT,
								},
								database: Config.REDIS_DB_NUMBER,
							});
						}
						await this.redisClient.connect();
					}
					return this.redisClient as RedisClientType;
				},
			},
		};
	}

	public start() {
		// eslint-disable-next-line no-underscore-dangle
		return this._schema;
	}
}

export const redisMixin = new RedisMixin().start();
