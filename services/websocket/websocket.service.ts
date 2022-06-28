/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer, { Context, Errors } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import { Service, Method, Post } from '@ourparentcenter/moleculer-decorators-extended';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

const pubClient = createClient({
	username: Config.REDIS_USERNAME,
	password: Config.REDIS_PASSWORD,
	socket: {
		host: Config.REDIS_HOST,
		port: Config.REDIS_PORT,
	},
	database: Config.REDIS_DB_NUMBER,
});
const subClient = pubClient.duplicate();
@Service({
	name: 'io',
	//@ts-ignore
	mixins: [ApiGatewayService, SocketIOMixin],
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	actions: {
		// join(ctx) {
		// 	this.ctx.meta.$join = ctx.params.room;
		// },
		// leave(ctx) {
		// 	ctx.meta.$leave = ctx.params.room;
		// },
		// list(ctx) {
		// 	return ctx.meta.$rooms;
		// },
		// emitEvent(ctx) {
		// 	this.broker.emit('hello', 'world');
		// },
	},
	started: async () => {
		console.log('started');
		// actions.emitEvent('test', { test: 'test' });
		// let a = function () {};
		// var interval = setInterval(function () {
		// 	console.log(1);
		// 	//@ts-ignore
		// 	this.adapter.publish('test', 'test');
		// }, 1000);
	},
	settings: {
		port: 3001,
		io: {
			options: {
				adapter: createAdapter(pubClient, subClient),
			},
		},
		namespaces: {
			'/': {
				authorization: false,
				middlewares: [],
				packetMiddlewares: [],
				events: {
					call: {
						mappingPolicy: 'all',
						aliases: {
							add: 'math.add',
						},
						whitelist: ['math.*'],
						callOptions: {},
						// @ts-ignore
						onBeforeCall: async function (ctx, socket, action, params, callOptions) {
							ctx.meta.socketid = socket.id;
						},
						// @ts-ignore
						onAfterCall: async function (ctx, socket, res) {
							socket.emit('afterCall', res);
						},
					},
				},
			},
		},
	},
})
export default class WebsocketService extends moleculer.Service {}
