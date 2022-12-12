'use strict';
import { ServerResponse } from 'http';
import moleculer from 'moleculer';
import ApiGateway from 'moleculer-web';
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
import { RequestMessage } from 'types';
import pick from 'lodash/pick';
import { ApolloService } from 'moleculer-apollo-server';
import { RESOLVERS, TYPE_DEFS } from '../../types/graphql/schema';

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
@Service({
	name: 'graphql-api',
	mixins: [
		ApiGateway,
		// GraphQL Apollo Server
		ApolloService({
			// @ts-ignore
			typeDefs: TYPE_DEFS,
			resolvers: RESOLVERS,

			// https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
			serverOptions: {
				tracing: true,
			},
		}),
	],
	settings: {
		port: 3003,
		// API Gateway route options
		routeOptions: {
			path: '/graphql',
			cors: true,
			mappingPolicy: 'restrict',
		},
	},
})
export default class GraphQLApiService extends moleculer.Service {
	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	public onError(req: RequestMessage, res: ServerResponse, err: any): void {
		// Return with the error as JSON object
		res.setHeader('Content-type', 'application/json; charset=utf-8');
		res.writeHead(err.code || 500);

		if (err.code === 422) {
			const o: any = {};
			err.data.forEach((e: any) => {
				const field = e.field.split('.').pop();
				o[field] = e.message;
			});

			res.end(JSON.stringify({ errors: o }, null, 2));
		} else {
			const errObj = pick(err, ['name', 'message', 'code', 'type', 'data']);
			res.end(JSON.stringify(errObj, null, 2));
		}
		this.logResponse(req, res, err ? err.ctx : null);
	}
}
