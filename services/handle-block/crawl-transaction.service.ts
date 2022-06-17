/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require ('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { sha256 } from 'js-sha256';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
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
					async process(job : Job) {
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
						listTx.map((tx: any) => {
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
	async handleJob(listTx: any) {
		// this.logger.info(`Handle job: ${JSON.stringify(listTx)}`);
		listTx.map(async (tx: any) => {
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

		this.getQueue('crawl.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.block').on('failed', (job: Job ) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
