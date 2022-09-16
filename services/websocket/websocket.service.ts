/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Context, Service, ServiceBroker } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { Job } from 'bull';
import { ListTxInBlockParams, TransactionArrayParam } from 'types';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from 'redis';
import { ITransaction } from 'entities';
const QueueService = require('moleculer-bull');

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
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'websocket.tx-handle',
					},
				),
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
			},
			events: {
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'websocket.tx-handle',
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
			settings: {
				port: 3000,
				io: {
					options: {}, //socket.io options
					namespaces: {
						'/register': {
							events: {
								call: {
									whitelist: ['v1.io.client-register', 'v1.io.broadcast'],
								},
							},
						},
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
				'broadcast': {
					async handler(ctx: Context<ListTxInBlockParams>) {
						// @ts-ignore
						await this.io.emit("listTx", ctx.params.listTx);
					},
				},
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

			//Get all tx of a block
			let listInsideTx: string[] = [];
			listTx.forEach((x) => {
				listInsideTx.push(x.tx_response.txhash.toString());
			});

			let sameTx: any[] = [];

			syncTx.forEach((tx) => {
				if (listInsideTx.indexOf(tx) > 0) {
					sameTx.push(tx);
				}
			});

			//Broadcast message to websocket channel using broker call io service what is defined in constructor
			if (true) {
				await this.broker?.call('v1.io.broadcast', {
					namespace: '/register',
					event: 'hello',
					args: [listTx],
				});
			}

			return [];
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	async _start() {
		this.getQueue('websocket.tx-handle').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('websocket.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('websocket.tx-handle').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
