/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer, { Context, Errors } from 'moleculer';
import SocketIOMixin from 'moleculer-io';
import { Service, Method, Post } from '@ourparentcenter/moleculer-decorators-extended';
import ApiGatewayService from 'moleculer-web';
import { Config } from '../../common';
import { io } from 'socket.io-client';
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */

@Service({
	name: 'math',
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	actions: {
		add(ctx) {
			return Number(ctx.params.a) + Number(ctx.params.b);
		},
	},
	started(): any {
		const socket = io('ws://localhost:3001');
		socket.on('open', () => {
			console.log('socket open');
		});
		socket.on('connect', () => {
			console.log('socket connected');
		});
		socket.on('abc', (arg) => {
			console.log(arg); // world
		});

		socket.onAny((event, data) => {
			console.log('event ne');
			console.log(event, data);
		});

		// socket.emit('call', 'math.add', { a: 123, b: 456 }, function (err: any, res: any) {
		// 	if (err) {
		// 		console.error(err);
		// 	} else {
		// 		console.log('call success:', res);
		// 	}
		// });
		return true;
	},
})
//@ts-ignore
export default class MathService extends moleculer.Service {}
