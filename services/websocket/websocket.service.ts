/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer, { Context, Errors } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import { Service, Method, Post } from '@ourparentcenter/moleculer-decorators-extended';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { createAdapter } from 'socket.io-redis';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
const redisAdapter = createAdapter(
	`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
);
@Service({
	name: 'io',
	//@ts-ignore
	mixins: [ApiGatewayService, SocketIOMixin],
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		port: 3001,
		io: {
			options: {
				adapter: redisAdapter,
			},
		},
	},
})
export default class WebsocketService extends moleculer.Service {}
