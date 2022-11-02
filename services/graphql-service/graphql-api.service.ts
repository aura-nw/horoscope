'use strict';
import moleculer from 'moleculer';
import mongoose from 'mongoose';
import ApiGateway from 'moleculer-web';
const { ApolloService } = require("moleculer-apollo-server");
import { Service } from '@ourparentcenter/moleculer-decorators-extended';
// import { context } from "./context";
import { Config } from '../../common';
import { RequestMessage } from 'types';
import { ServerResponse } from 'http';
import { pick } from 'lodash';
import { Resolvers, TypeDefs } from '../../types/graphql/schema';

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
            typeDefs: TypeDefs,
            resolvers: Resolvers,

            // https://www.apollographql.com/docs/apollo-server/v2/api/apollo-server.html
            serverOptions: {
                tracing: true,
            },
        }),
    ],
    settings: {
        port: Config.PORT || 3000,
        // API Gateway route options
        routeOptions: {
            path: "/graphql",
            cors: true,
            mappingPolicy: "restrict",
        },
    }
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

