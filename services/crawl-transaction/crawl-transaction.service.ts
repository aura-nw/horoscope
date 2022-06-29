/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { sha256 } from 'js-sha256';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
export default class CrawlTransactionService extends Service {
	private redisMixin = new RedisMixin().start();
	private callApiMixin = new CallApiMixin().start();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltransaction',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.transaction',
					},
				),
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
			},
			events: {
				'list-transaction.created': {
					handler: async (ctx: any) => {
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
								},
							);
						}
					},
				},
			},
		});
	}

	async initEnv() {}
	async handleJob(listTx: any) {
		// this.logger.info(`Handle job: ${JSON.stringify(listTx)}`);
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);

		listTx.map(async (tx: any) => {
			const txHash = sha256(Buffer.from(tx, 'base64')).toUpperCase();
			this.logger.info(`txhash: ${txHash}`);
			let result = await this.callApiFromDomain(url, `${Config.GET_TX_API}0x${txHash}`);
			if (result && result.result) {
				this.redisClient.sendCommand([
					'XADD',
					Config.REDIS_STREAM_TRANSACTION_NAME,
					'*',
					'element',
					JSON.stringify(result.result),
				]);
				this.logger.debug(`result: ${JSON.stringify(result)}`);
			}
		});
	}

	async _start() {
		this.redisClient = await this.getRedisClient();

		this.getQueue('crawl.transaction').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.transaction').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.transaction').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
