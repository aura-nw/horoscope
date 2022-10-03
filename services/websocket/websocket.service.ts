/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
const QueueService = require('moleculer-bull');
import { Context, Service, ServiceBroker } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { Job } from 'bull';
import { ListTxInBlockParams, TransactionArrayParam } from 'types';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from 'redis';
import { ITransaction } from 'entities';
import { MSG_TYPE } from 'common/constant';
import QueueConfig from '../../config/queue';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

const SORTEDSET = Config.WEBOSCKET_SORTEDSET;

export default class WebsocketService extends Service {
	private redisMixin = new RedisMixin().start();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'io',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				ApiGatewayService,
				SocketIOMixin,
				this.redisMixin,
			],
			queues: {
				'websocket.tx-handle': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_TX_WEBSOCKET, 10),
					process(job: Job) {
						// @ts-ignore
						this.handleNewBlock(job.data.listTx);

						return true;
					},
				},
				'websocket.safe-tx-handle': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_TX_WEBSOCKET, 10),
					process(job: Job) {
						// @ts-ignore
						this.handleSafeTx(job.data.listTx);

						return true;
					},
				},
			},
			settings: {
				port: 3000,
				io: {
					options: {}, //socket.io options
					namespaces: {
						'/register': {
							events: {
								call: {
									whitelist: ['v1.io.*', 'io.*'],
								},
							},
						},
					},
				},
			},
			events: {
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'websocket.safe-tx-handle',
							{
								listTx: ctx.params.listTx,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
			actions: {
				'client-register': {
					async handler(ctx: Context<TransactionArrayParam>) {
						// @ts-ignore
						await this.clientRegister(ctx);
					},
				},
				'safe-register': {
					async handler() {
						// @ts-ignore
						return true;
					},
				},
				// 'broadcast-message': {
				// 	async handler(ctx: Context) {
				// 		// @ts-ignore
				// 		await this.broker?.call("v1.io.broadcast", ctx.params.args);
				// 		// return ctx.params?.args;
				// 	},
				// },
			},
		});
	}
	//@ts-ignore
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	async clientRegister(ctx: Context<TransactionArrayParam>) {
		let redisClient: RedisClientType = await this.getRedisClient();

		this.logger.info('Tx need to crawl' + ctx.params.txHashArr);

		await redisClient.SADD(SORTEDSET, ctx.params.txHashArr);
	}

	async handleNewBlock(listTx: ITransaction[]): Promise<any[]> {
		try {
			let redisClient: RedisClientType = await this.getRedisClient();

			//Get all member of set Transactions
			let syncTx = await redisClient.SMEMBERS(SORTEDSET);

			this.logger.info('ListTx ' + syncTx);

			let txHadCrawl: any[] = await this.broker?.call('v1.transaction.find', {
				query: {
					'tx_response.txhash': { $in: syncTx },
				},
			});

			//Broadcast message to websocket channel using broker call io service what is defined in constructor
			if (txHadCrawl.length > 0) {
				await this.broker?.call('v1.io.broadcast', {
					namespace: '/register',
					event: 'broadcast-message',
					args: [txHadCrawl],
				});

				await Promise.all(
					txHadCrawl.map(async (tx) => {
						await redisClient.SREM(SORTEDSET, tx.tx_response.txhash);
					}),
				);
			}

			return [];
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async handleSafeTx(listTx: ITransaction[]): Promise<any[]> {
		this.logger.info('Start handle safe tx');
		try {
			listTx = listTx.filter((txs) =>
				txs.tx.body.messages.find(
					(m: any) =>
						m['@type'] === MSG_TYPE.MSG_SEND || m['@type'] === MSG_TYPE.MSG_MULTI_SEND,
				),
			);
			this.logger.info('List tx need to handle ' + JSON.stringify(listTx));
			if (listTx.length > 0) {
				await this.broker?.call('v1.io.broadcast', {
					namespace: '/register',
					event: 'broadcast-safe-message',
					args: [listTx],
				});
			}
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async _start() {
		this.createJob(
			'websocket.tx-handle',
			{
				param: `param`,
			},
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
		this.getQueue('websocket.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('websocket.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('websocket.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});

		this.getQueue('websocket.safe-tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('websocket.safe-tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('websocket.safe-tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'websocket.tx-handle' });
			await this.broker.call('api.add_queue', { queue_name: 'websocket.safe-tx-handle' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
