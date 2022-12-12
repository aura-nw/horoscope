/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */

import moleculer from 'moleculer';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
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
			// @ts-ignore
			this.broker.call('io.broadcast', { event: 'abc', args: [ctx.params.a, ctx.params.b] });

			return Number(ctx.params.a) + Number(ctx.params.b);
		},
		minus(ctx) {
			// @ts-ignore
			this.broker.call('io.broadcast', { event: 'abc', args: [ctx.params.a, ctx.params.b] });

			return Number(ctx.params.a) - Number(ctx.params.b);
		},
	},
	// Started: async (): Promise<unknown> => {
	// 	Console.log('network info');
	// 	Console.log(LIST_NETWORK);
	// 	Console.log(LIST_NETWORK[0].chainId);

	// 	Const socket = io('ws://localhost:3001');
	// 	Socket.on('open', () => {
	// 		Console.log('socket open');
	// 	});
	// 	Socket.on('connect', () => {
	// 		Console.log('socket connected');
	// 	});
	// 	Socket.on('abc', (...arg) => {
	// 		Console.log('listen abc: ', arg);
	// 	});

	// 	Socket.onAny((event, ...data) => {
	// 		Console.log('event ne');
	// 		Console.log(event, data);
	// 	});

	// Socket.emit('call', 'math.add', { a: 123, b: 456 }, function (err: any, res: any) {
	// 	If (err) {
	// 		Console.error(err);
	// 	} else {
	// 		Console.log('call success:', res);
	// 	}
	// });
	// 	Return true;
	// },
})
// @ts-ignore
export default class MathService extends moleculer.Service {}
