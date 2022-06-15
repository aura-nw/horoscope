/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { sha256 } from 'js-sha256';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
export default class CrawlTransactionService extends Service {
	private redisMixin = new RedisMixin().start();
	private redisClient;
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
					async process(job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				crawlListTransaction: {
					params: {
						listTx: { type: 'array' },
					},
					async handler(ctx) {
						const listTx = ctx.params.listTx;
						listTx.map((tx) => {
							this.createJob(
								'crawl.transaction',
								{
									listTx: listTx,
								},
								{
									removeOnComplete: true,
								},
							);
						});
						return listTx;
					},
				},
			},
		});
	}

	async initEnv() {}
	async handleJob(listTx) {
		// this.logger.info(`Handle job: ${JSON.stringify(listTx)}`);
		listTx.map(async (tx) => {
			const txHash = sha256(Buffer.from(tx, 'base64')).toUpperCase();
			this.logger.debug(`txhash: ${txHash}`);
			if (txHash === '4783A37DDC4B1A03259AF142B402611770C75CB7E0CF11D61D2990E068EDF0B6') {
				this.logger.info(1);
			}
			let result = await this.callApi(
				URL_TYPE_CONSTANTS.RPC,
				`${Config.GET_TX_API}0x${txHash}`,
			);
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

		this.getQueue('crawl.transaction').on('completed', (job, res) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, res);
		});
		this.getQueue('crawl.transaction').on('failed', (job, err) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, err);
		});
		this.getQueue('crawl.transaction').on('progress', (job, progress) => {
			this.logger.info(`Job #${job.id} progress is ${progress}%`);
		});
		return super._start();
	}
}
