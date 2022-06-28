/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer, { Context, Errors } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import { Service, Method, Post } from '@ourparentcenter/moleculer-decorators-extended';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
@Service({
	name: 'io',
	//@ts-ignore
	mixins: [ApiGatewayService, SocketIOMixin],
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		port: 3001,
		io: {
			options: {
				adapter: require('socket.io-redis')(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
				),
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
