/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ListTxInBlockParams, TransactionHashParam } from 'types';
import CallApiMixin from '../../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../../common/constant';
import { Utils } from '../../../utils/utils';
import { Config } from '../../../common';
import { queueConfig } from '../../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
// Var heapdump = require('heapdump');

export default class CrawlTransactionService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltransaction',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), new CallApiMixin().start()],
			queues: {
				'crawl.transaction': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.crawlTransactionByBlockHeight(
							// job.data.listTx,
							job.data.blockHeight,
							job.data.chainId,
							job.data.timestamp,
						);
						job.progress(100);
						return true;
					},
				},
				'crawl.transaction-hash': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.crawlTransactionByTxHash(job.data.txhash, job.data.chainId);
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
									listTx,
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
		});
	}

	async handleJob(blockHeight: string, chainId: string, timestamp: string) {
		await this.crawlTransactionByBlockHeight(blockHeight, chainId, timestamp);
	}

	async crawlTransactionByBlockHeight(blockHeight: string, chainId: string, timestamp: string) {
		const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.RPC);
		const result = await this.callApiFromDomain(
			url,
			`${Config.SEARCH_TX}?query="tx.height=${blockHeight}"`,
		);

		if (result && result.result) {
			this.createJob(
				'handle.transaction',
				{
					chainId,
					listTx: result.result,
					timestamp,
				},
				{
					removeOnComplete: true,
				},
			);
			this.logger.debug(`result: ${JSON.stringify(result)}`);
		}
	}
	async crawlTransactionByTxHash(txHash: string, chainId: string) {
		this.logger.info(`txhash: ${txHash}`);
		const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
		const result = await this.callApiFromDomain(url, `${Config.GET_TX_API}${txHash}`);

		if (result) {
			this.createJob(
				'handle.transaction',
				{
					source: txHash,
					tx: result,
				},
				{
					removeOnComplete: true,
				},
			);
			this.logger.debug(`result: ${JSON.stringify(result)}`);
		}
	}
	public async _start() {
		this.getQueue('crawl.transaction').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.transaction').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.transaction').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
