/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Context, CallingOptions, Service, ServiceBroker } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { Job } from 'bull';
import { ListTxCreatedParams, TransactionArrayParam } from 'types';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from 'redis';
import { ITransaction } from 'entities';
const QueueService = require('moleculer-bull');

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

const MAX_RETRY_REQ = Config.ASSET_INDEXER_MAX_RETRY_REQ;
const ACTION_TIMEOUT = Config.ASSET_INDEXER_ACTION_TIMEOUT;
const OPTs: CallingOptions = { timeout: ACTION_TIMEOUT, retries: MAX_RETRY_REQ };

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
					process(job: Job) {
						// @ts-ignore
						this.handleNewBlock(job.data.listTx, job.data.chainId);

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
								chainId: ctx.params.chainId,
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
								'call': {
									whitelist: ['v1.io.client-register'],
								}
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
			}
		});
	}
	//@ts-ignore
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	async clientRegister(ctx: Context<TransactionArrayParam>) {
		let redisClient: RedisClientType = await this.getRedisClient();
		let result = await redisClient.SADD("hash", ctx.params.txHashArr);
		this.logger.info(result);
	}

	async txFilter(ctx: Context<ListTxCreatedParams>) { }

	async handleNewBlock(listTx: ITransaction[], chainId: string): Promise<any[]> {
		try {
			let redisClient: RedisClientType = await this.getRedisClient();
			this.logger.info('listTx', listTx);
			let blockTxHash = listTx[0].tx_response.txhash;
			let txHashChecked = await redisClient.SISMEMBER('myhash', blockTxHash.toString());

			this.logger.info('Check', txHashChecked);

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
