/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
// import createService from 'moleculer-bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { BlockResponseFromLCD, ResponseFromRPC } from '../../types';
import { IBlock } from 'entities';

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
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.block',
					},
				),
				this.callApiMixin,
				this.redisMixin,
			],
			queues: {
				'crawl.block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.initEnv();
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async initEnv() {
		//get handled block
		let handledBlockRedis = await this.redisClient.get(Config.REDIS_KEY_CURRENT_BLOCK);
		this.currentBlock = 0;
		let START_BLOCK = Config.START_BLOCK;

		if (handledBlockRedis) {
			this.currentBlock = parseInt(handledBlockRedis);
		} else {
			if (!isNaN(START_BLOCK)) {
				this.currentBlock = parseInt(START_BLOCK);
			} else {
				this.currentBlock = 0;
			}
		}
		this.currentBlock = handledBlockRedis ? parseInt(handledBlockRedis) : this.currentBlock;
		this.logger.info(`currentBlock: ${this.currentBlock}`);
	}
	async handleJob() {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);
		const responseGetLatestBlock = await this.callApiFromDomain(
			url,
			`${Config.GET_LATEST_BLOCK_API}`,
		);
		const latestBlockNetwork = parseInt(responseGetLatestBlock.result.block.header.height);
		this.logger.info(`latestBlockNetwork: ${latestBlockNetwork}`);

		const startBlock = this.currentBlock + 1;

		let endBlock = startBlock + parseInt(Config.NUMBER_OF_BLOCK_PER_CALL) - 1;
		if (endBlock > latestBlockNetwork) {
			endBlock = latestBlockNetwork;
		}
		this.logger.info('startBlock: ' + startBlock + ' endBlock: ' + endBlock);
		try {
			let listPromise = [];
			for (let i = startBlock; i <= endBlock; i++) {
				listPromise.push(
					this.callApiFromDomain(url, `${Config.GET_BLOCK_BY_HEIGHT_API}${i}`),
				);
			}
			let resultListPromise: ResponseFromRPC[] = await Promise.all(listPromise);

			let data: ResponseFromRPC = {
				id: '',
				jsonrpc: '',
				result: {
					blocks: resultListPromise.map((item) => {
						return item.result;
					}),
				},
			};
			// this.logger.info(data);
			// let data: ResponseFromRPC = await this.callApiFromDomain(
			// 	url,
			// 	`${Config.GET_BLOCK_API}\"block.height >= ${startBlock} AND block.height <= ${endBlock}\"&order_by="asc"&per_page=${Config.NUMBER_OF_BLOCK_PER_CALL}`,
			// );
			if (data == null) {
				throw new Error('cannot crawl block');
			}
			this.handleListBlock(data);
			this.currentBlock = endBlock;
			let redisClient: RedisClientType = await this.getRedisClient();
			redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, this.currentBlock);
		} catch (error) {
			this.logger.error(error);
			throw new Error('cannot crawl block');
		}
	}
	async handleListBlock(data: ResponseFromRPC) {
		const listBlock: BlockResponseFromLCD = data.result;
		listBlock.blocks.map((block: IBlock) => {
			//pust block to redis stream
			this.logger.info('xadd block: ' + block?.block?.header?.height);

			this.redisClient.sendCommand([
				'XADD',
				Config.REDIS_STREAM_BLOCK_NAME,
				'*',
				'source',
				block.block?.header?.height,
				'element',
				JSON.stringify(block),
			]);
		});
	}
	getStatistic() {
		this.getQueue('crawl.block')
			.getCompletedCount()
			.then((count: String) => {
				this.logger.info(`Completed jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getFailedCount()
			.then((count: String) => {
				this.logger.info(`Failed jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getActiveCount()
			.then((count: String) => {
				this.logger.info(`Active jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getWaitingCount()
			.then((count: String) => {
				this.logger.info(`Waiting jobs: ${count}`);
			});
	}
	async _start() {
		this.redisClient = await this.getRedisClient();
		this.createJob(
			'crawl.block',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_BLOCK, 10),
				},
			},
		);
		this.getQueue('crawl.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
