/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { sha256 } from 'js-sha256';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { ListTxInBlockParams, TransactionHashParam } from 'types';
import { QueueConfig } from '../../config/queue';
var heapdump = require('heapdump');

export default class CrawlTransactionService extends Service {
	private redisMixin = new RedisMixin().start();
	private callApiMixin = new CallApiMixin().start();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltransaction',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.redisMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.transaction': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx);
						job.progress(100);
						return true;
					},
				},
				'crawl.transaction-hash': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.crawlTransaction(job.data.txhash);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'list-transaction.created': {
					handler: async (ctx: Context<ListTxInBlockParams, Record<string, unknown>>) => {
						const listTx = ctx.params.listTx;
						this.logger.info(`Crawl list transaction: ${JSON.stringify(listTx)}`);
						if (listTx && listTx.length > 0) {
							this.createJob(
								'crawl.transaction',
								{
									listTx: listTx,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);
						}
					},
				},
				'crawl-transaction-hash.retry': {
					handler: async (
						ctx: Context<TransactionHashParam, Record<string, unknown>>,
					) => {
						const txHash = ctx.params.txHash;
						this.logger.info(
							`Crawl transaction by hash retry: ${JSON.stringify(txHash)}`,
						);
						if (txHash) {
							this.createJob(
								'crawl.transaction-hash',
								{
									txhash: txHash,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);
						}
					},
				},
			},
			actions: {
				writeHeapDump: {
					async handler(ctx: Context) {
						this.writeHeapDump();
					},
				},
			},
		});
	}

	async writeHeapDump() {
		if (Config.PATH_HEAP_DUMP) {
			let path =
				Config.PATH_HEAP_DUMP + new Date().toISOString().split('T')[0] + '.heapsnapshot';
			this.logger.info('write to heap log: ', path);

			heapdump.writeSnapshot(path);
		}
	}
	async handleJob(listTx: string[]) {
		listTx.map((tx: string) => {
			const txHash = sha256(Buffer.from(tx, 'base64')).toUpperCase();
			this.crawlTransaction(txHash);
		});
	}

	async crawlTransaction(txHash: string) {
		this.logger.info(`txhash: ${txHash}`);
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		let result = await this.callApiFromDomain(url, `${Config.GET_TX_API}${txHash}`);

		if (result) {
			this.redisClient.sendCommand([
				'XADD',
				Config.REDIS_STREAM_TRANSACTION_NAME,
				'*',
				'source',
				txHash,
				'element',
				JSON.stringify(result),
			]);
			this.logger.debug(`result: ${JSON.stringify(result)}`);
		}
	}
	async _start() {
		this.redisClient = await this.getRedisClient();
		this.getQueue('crawl.transaction').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.transaction').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.transaction').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
