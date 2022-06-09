/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';

export default class CrawlBlockService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private redisMixin = new RedisMixin().start();

	private currentBlock = 0;
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlblock',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}`,
					{
						prefix: 'crawl.proposal',
						limiter: {
							max: 1,
							duration: 1000,
							bounceBack: true,
						},
					},
				),
				this.callApiMixin,
				this.redisMixin,
			],
			queues: {
				'crawl.block': {
					concurrency: 1,
					async process(job) {
						job.progress(10);
						// @ts-ignore
						this.logger.info('New job received! tuan-test', job.data);
						// @ts-ignore
						await this.initEnv();
						// @ts-ignore
						await this.handleJob(job.data.url);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}
	async initEnv() {
		//get handled block
		this.logger.info('initEnv');

		let redisClient: RedisClientType = await this.getRedisClient();
		let handledBlockRedis = await redisClient.get(Config.REDIS_KEY_CURRENT_BLOCK);
		this.currentBlock = 0;
		let START_BLOCK = Config.START_BLOCK;

		if (handledBlockRedis) {
			this.currentBlock = parseInt(handledBlockRedis);
		} else {
			if (!isNaN(START_BLOCK)) {
				this.currentBlock = START_BLOCK;
			} else {
				this.currentBlock = 0;
			}
		}
		this.currentBlock = handledBlockRedis ? parseInt(handledBlockRedis) : 0;
		this.logger.info(`currentBlock: ${this.currentBlock}`);
	}
	async handleJob(url) {
		this.logger.info(url);
		const responseGetLatestBlock = await this.callApi(
			`${Config.RPC_URL}${Config.GET_LATEST_BLOCK_API}`,
		);
		const latestBlockNetwork = parseInt(responseGetLatestBlock.result.block.header.height);
		this.logger.info(`latestBlockNetwork: ${latestBlockNetwork}`);

		const startBlock = this.currentBlock + 1;
		let endBlock = startBlock + Config.NUMBER_OF_BLOCK_PER_CALL - 1;
		if (endBlock > latestBlockNetwork) {
			endBlock = latestBlockNetwork;
		}
		console.log('startBlock: ' + startBlock + ' endBlock: ' + endBlock);
		const query = `${Config.RPC_URL}${Config.GET_BLOCK_API}\"block.height >= ${startBlock} AND block.height <= ${endBlock}\"&order_by="asc"&per_page=${Config.NUMBER_OF_BLOCK_PER_CALL}`;
		let data = await this.callApi(query);
		this.handleListBlock(data.data);
		this.currentBlock = endBlock;
		let redisClient: RedisClientType = await this.getRedisClient();
		redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, this.currentBlock);
	}
	async handleListBlock(data) {
		const listBlock = data.result.blocks;
		// console.log(JSON.stringify(listBlock));
		let redisClient: RedisClientType = await this.getRedisClient();
		listBlock.map((block) => {
			//pust block to redis stream
			console.log('xadd block: ' + block.block.header.height);

			redisClient.sendCommand([
				'XADD',
				Config.REDIS_STREAM_BLOCK_NAME,
				'*',
				'element',
				JSON.stringify(block),
			]);
		});
	}
	async _start() {
		this.createJob(
			'crawl.block',
			{
				url: `123`,
			},
			{
				removeOnComplete: false,
				repeat: {
					limit: 50,
					count: 0,
					every: 5000,
				},
			},
		);
		this.getQueue('crawl.block').on('global:progress', (jobID, progress) => {
			this.logger.info(`Job #${jobID} progress is ${progress}%`);
		});

		this.getQueue('crawl.block').on('global:completed', (job, res) => {
			this.logger.info(`Job #${job} completed!. Result:`, res);
		});
		return super._start();
	}
}
