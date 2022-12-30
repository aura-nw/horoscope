/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import { RedisClientType } from '@redis/client';
import { Job } from 'bull';
import { IBlock } from 'entities';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Utils } from '../../utils/utils';
import { BlockResponseFromLCD, ResponseFromRPC } from '../../types';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlBlockService extends Service {
	private _currentBlock = 0;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this;
		this.parseServiceSchema({
			name: 'crawlblock',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				new CallApiMixin().start(),
				new RedisMixin().start(),
			],
			queues: {
				'crawl.block': {
					concurrency: 1,
					process: async (job: Job) => {
						job.progress(10);
						await self.initEnv();
						await self.handleJobCrawlBlock();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async initEnv() {
		// Get handled block
		const handledBlockRedis = await this.redisClient.get(Config.REDIS_KEY_CURRENT_BLOCK);
		this._currentBlock = 0;
		const START_BLOCK = Config.START_BLOCK;

		if (handledBlockRedis) {
			this._currentBlock = parseInt(handledBlockRedis, 10);
		} else {
			if (!isNaN(START_BLOCK)) {
				this._currentBlock = parseInt(START_BLOCK, 10);
			} else {
				this._currentBlock = 0;
			}
		}
		this._currentBlock = handledBlockRedis
			? parseInt(handledBlockRedis, 10)
			: this._currentBlock;
		this.logger.info(`_currentBlock: ${this._currentBlock}`);
	}
	async handleJobCrawlBlock() {
		const redisClient: RedisClientType = await this.getRedisClient();

		const latestBlockRedis = parseInt(
			(await redisClient.get(Config.REDIS_KEY_LATEST_BLOCK)) ?? '0',
			10,
		);

		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);
		const responseGetLatestBlock = await this.callApiFromDomain(
			url,
			`${Config.GET_LATEST_BLOCK_API}`,
			1,
		);
		const latestBlockNetwork = parseInt(responseGetLatestBlock.result.block.header.height, 10);

		if (latestBlockNetwork > latestBlockRedis) {
			await redisClient.set(Config.REDIS_KEY_LATEST_BLOCK, latestBlockNetwork);
		}

		this.logger.info(`latestBlockNetwork: ${latestBlockNetwork}`);

		const startBlock = this._currentBlock + 1;

		let endBlock = startBlock + parseInt(Config.NUMBER_OF_BLOCK_PER_CALL, 10) - 1;
		if (endBlock > Math.max(latestBlockNetwork, latestBlockRedis)) {
			endBlock = Math.max(latestBlockNetwork, latestBlockRedis);
		}
		this.logger.info(`startBlock: ${startBlock} endBlock: ${endBlock}`);
		try {
			const listPromise = [];
			for (let i = startBlock; i <= endBlock; i++) {
				listPromise.push(
					this.callApiFromDomain(url, `${Config.GET_BLOCK_BY_HEIGHT_API}${i}`, 2),
				);
			}
			const resultListPromise: ResponseFromRPC[] = await Promise.all(listPromise);

			const data: ResponseFromRPC = {
				id: '',
				jsonrpc: '',
				result: {
					blocks: resultListPromise.map((item) => item.result),
				},
			};

			this.handleListBlock(data);
			if (this._currentBlock < endBlock) {
				this._currentBlock = endBlock;
				redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, this._currentBlock);
			}
		} catch (error) {
			this.logger.error(error);
			throw new Error('cannot crawl block');
		}
	}

	async handleListBlock(data: ResponseFromRPC) {
		const listBlock: BlockResponseFromLCD = data.result;
		listBlock.blocks.map((block: IBlock) => {
			// Pust block to redis stream
			this.logger.info(`create job handle block: ${block?.block?.header?.height}`);

			// This.redisClient.xAdd(Config.REDIS_STREAM_BLOCK_NAME, '*', {
			// 	Source: block.block?.header?.height,
			// 	Element: JSON.stringify(block),
			// });

			this.createJob(
				'handle.block',
				{
					source: block.block?.header?.height,
					block,
				},
				{
					removeOnComplete: true,
				},
			);
		});
	}
	getStatistic() {
		this.getQueue('crawl.block')
			.getCompletedCount()
			.then((count: string) => {
				this.logger.info(`Completed jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getFailedCount()
			.then((count: string) => {
				this.logger.info(`Failed jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getActiveCount()
			.then((count: string) => {
				this.logger.info(`Active jobs: ${count}`);
			});
		this.getQueue('crawl.block')
			.getWaitingCount()
			.then((count: string) => {
				this.logger.info(`Waiting jobs: ${count}`);
			});
	}
	public async _start() {
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
