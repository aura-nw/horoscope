/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { BlockResponseFromLCD, ResponseFromRPC } from '../../types';
import { IBlock } from 'entities';
import { QueueConfig } from '../../config/queue';

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
				QueueService(QueueConfig.redis, QueueConfig.opts),
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
						await this.handleJobCrawlBlock();
						job.progress(100);
						return true;
					},
				},
				'crawl.block-from-lcd': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						const url = job.data.url;
						const pathBlock = job.data.path;
						// @ts-ignore
						await this.handleJobCrawlBlockLCD(url, path);
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
	async handleJobCrawlBlock() {
		let redisClient: RedisClientType = await this.getRedisClient();

		const latestBlockRedis = parseInt(
			(await redisClient.get(Config.REDIS_KEY_LATEST_BLOCK)) ?? '0',
			10,
		);

		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);
		const responseGetLatestBlock = await this.callApiFromDomain(
			url,
			`${Config.GET_LATEST_BLOCK_API}`,
		);
		const latestBlockNetwork = parseInt(responseGetLatestBlock.result.block.header.height);

		if (latestBlockNetwork > latestBlockRedis) {
			await redisClient.set(Config.REDIS_KEY_LATEST_BLOCK, latestBlockNetwork);
		}

		this.logger.info(`latestBlockNetwork: ${latestBlockNetwork}`);

		const startBlock = this.currentBlock + 1;

		let endBlock = startBlock + parseInt(Config.NUMBER_OF_BLOCK_PER_CALL) - 1;
		if (endBlock > Math.min(latestBlockNetwork, latestBlockRedis)) {
			endBlock = Math.min(latestBlockNetwork, latestBlockRedis);
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

			if (data == null) {
				throw new Error('cannot crawl block');
			}
			this.handleListBlock(data);
			if (this.currentBlock < endBlock) {
				this.currentBlock = endBlock;
				redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, this.currentBlock);
			}
		} catch (error) {
			this.logger.error(error);
			throw new Error('cannot crawl block');
		}
	}
	async handleJobCrawlBlockLCD(url: string, path: string) {
		let block = await this.callApiFromDomain(url, path);
	}
	async handleListBlock(data: ResponseFromRPC) {
		const listBlock: BlockResponseFromLCD = data.result;
		listBlock.blocks.map((block: IBlock) => {
			//pust block to redis stream
			this.logger.info('xadd block: ' + block?.block?.header?.height);

			this.redisClient.xAdd(Config.REDIS_STREAM_BLOCK_NAME, '*', {
				source: block.block?.header?.height,
				element: JSON.stringify(block),
			});
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
			{},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_BLOCK, 10),
				},
			},
		);
		this.getQueue('crawl.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
