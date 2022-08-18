// import { ConfigService } from 'src/shared/services/config.service';
import { Config } from '../common';
const asyncRedis = require('async-redis');

export class RedisService {
	private REDIS_HOST: string;
	private REDIS_PORT: string;
	private REDIS_USERNAME: string;
	private client: any;

	constructor() {
		this.REDIS_HOST = Config.REDIS_HOST;
		this.REDIS_PORT = Config.REDIS_PORT;
		this.REDIS_USERNAME = Config.REDIS_USERNAME;
		this.client = asyncRedis.createClient({
			host: this.REDIS_HOST,
			port: this.REDIS_PORT,
			no_ready_check: true,
			username: this.REDIS_USERNAME,
		});
	}

	async addMessageToStream(message: string) {
		try {
			await this.client.xadd(Config.REDIS_STREAM_ASSET_NAME, '*', 'element', message);
		} catch (err) {
			throw err;
		}
	}

  async readMessageFromStream(){
    try {
      let result = await this.client.xrange(Config.REDIS_STREAM_ASSET_NAME, '-', '+');
      return result;
    } catch (error) {
      throw error;
    }
  }
}
