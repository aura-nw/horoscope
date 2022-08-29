/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer, { Context } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import { Action, Service } from '@ourparentcenter/moleculer-decorators-extended';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { createAdapter } from 'socket.io-redis';
import { Job } from 'bull';
import { ListTxCreatedParams, TransactionArrayParam } from 'types';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from 'redis';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
const redisAdapter = createAdapter(
	`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
);
const redisMixin = new RedisMixin().start();
@Service({
	name: 'io',
	broker: {},
	//@ts-ignore
	mixins: [
		ApiGatewayService,
		SocketIOMixin,
		redisMixin,
		QueueService(
			`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
			{
				prefix: 'websocket.tx-handle',
			},
		),
	],
	queues: {
		'websocket.tx-handle': {
			process(job: Job) {
				// @ts-ignore
				this.handleJob(URL, job.data.listTx, job.data.chainId);

				return true;
			},
		},
	},
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		port: 3000,
		io: {
			options: {}, //socket.io options
			namespaces: {
				'/register': {
					events: {
						call: {
							whitelist: ['io.clientRegister'],
						},
					},
				},
			},
		},
	},
	events: {
		//Subcribe to 'list-tx.upsert' events
		'list-tx.upsert': {
			handler: async (ctx: Context<ListTxCreatedParams>) => {},
		},
	},
})
export default class WebsocketService extends moleculer.Service {
	@Action()
	async clientRegister(ctx: Context<TransactionArrayParam>) {
		let redisClient: RedisClientType = await this.getRedisClient();
		ctx.params.txHashArr.forEach((tx) => {
			redisClient.HSET('myhash', 'txHash', tx);
		});
	}

	async txFilter(ctx: Context<ListTxCreatedParams>) {}
}
