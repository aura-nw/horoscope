/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { IncomingMessage, ServerResponse } from 'http';
import moleculer, { Context, Errors } from 'moleculer';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import ApiGateway from 'moleculer-web';
import { Service, Method, Post } from '@ourparentcenter/moleculer-decorators-extended';
import pick from 'lodash/pick';
import { openAPIMixin } from '../../mixins/openapi/openapi.mixin';
import { Config } from '../../common';
import {
	RequestMessage,
	RestOptions,
	// UserJWT,
	// UserRole,
	// UserRolesParams,
	// UserTokenParams,
	// UserAuthMeta,
} from '../../types';
// import swStats from 'swagger-stats';
import swaggerSpec = require('../../swagger.json');
import { LIST_NETWORK } from '../../common/constant';
// const BullBoard = require('../../mixins/bullBoard/bull-board');

const tlBucket = 60000;
// const swMiddleware = swStats.getMiddleware({
// 	name: 'swagger-stats',
// 	timelineBucketDuration: tlBucket,
// 	uriPath: '/dashboard',
// 	swaggerSpec: swaggerSpec,
// });

const listLCD = LIST_NETWORK.map((e) => {
	return e.LCD;
}).flat();

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 * @typedef {import('http').IncomingMessage} IncomingRequest Incoming HTTP Request
 * @typedef {import('http').ServerResponse} ServerResponse HTTP Server Response
 */
@Service({
	name: 'api',
	mixins: [ApiGateway, openAPIMixin()],
	// More info about settings: https://moleculer.services/docs/0.14/moleculer-web.html
	settings: {
		port: Config.PORT || 3000,
		use: [
			cookieParser(),
			helmet({
				contentSecurityPolicy: {
					directives: {
						'default-src': ["'self'", ...listLCD],
						'connect-src': ["'self'", ...listLCD],
						'base-uri': ["'self'"],
						// 'block-all-mixed-content',
						'font-src': ["'self'"],
						'frame-ancestors': ["'self'"],
						'img-src': ["'self'", 'data:'],
						'object-src': ["'none'"],
						'script-src': ["'self'", "'unsafe-inline'"],
						'script-src-attr': ["'none'"],
						'style-src': ["'self'", "'unsafe-inline'"],
						'upgrade-insecure-requests': [],
					},
				},
			}),
		],
		routes: [
			// {
			// 	path: '/auth',
			// 	authorization: false,
			// 	authentication: false,
			// 	whitelist: ['v1.user.login'],
			// 	aliases: {
			// 		'POST /login': 'v1.user.login',
			// 	},
			// },
			// {
			// 	path: '/admin',
			// 	whitelist: ['$node.*', 'api.listAliases'],
			// 	authorization: true,
			// 	authentication: true,
			// 	// roles: [UserRole.SUPERADMIN],
			// 	aliases: {
			// 		'GET /health': '$node.health',
			// 		'GET /services': '$node.services',
			// 		'GET /actions': '$node.actions',
			// 		'GET /list': '$node.list',
			// 		'GET /metrics': '$node.metrics',
			// 		'GET /events': '$node.events',
			// 		'GET /options': '$node.options',
			// 		'GET /aliases': 'api.listAliases',
			// 	},
			// },
			{
				path: '/api',
				cors: {
					origin: ['*'],
					methods: ['GET', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
					credentials: false,
					maxAge: 3600,
				},
				whitelist: [
					// Access to any actions in all services under "/api" URL
					// '**',
					'v1.network.*',
					// 'v1.account-info.*',
					// 'v1.proposal.getByChain',
					// 'v1.validator.getByChain',
					// 'v1.block.getByChain',
					// 'v1.codeid.*',
					// 'v1.transaction.getByChain',
					// 'v1.test.*',
					'v1.account-info.getAccountInfo',
					'v1.account-info.getAccountDelegationInfo',
					'v1.account-info.getAccountStake',
					'v1.account-unbonds.getByAddress',
					'v1.proposal.getByChain',
					'v1.validator.getByChain',
					'v1.block.getByChain',
					// 'v1.asset.index',
					'v1.asset.*',
					'v1.codeid.*',
					'v1.transaction.getByChain',
					'v1.transaction.getPowerEvent',
					'v1.transaction.getIBCTx',
					'v1.param.getByChain',
					'v1.votes.getVotes',
					'v1.votes.getValidatorVote',
					'v1.ibc-denom.getByHash',
					'v1.ibc-denom.addNewDenom',
					'v1.validator.getAllByChain',
					'v1.feegrant.getGrants',
					'v1.account-statistics.getTopAccounts',
					'v1.daily-tx-statistics.getDailyData',
					'v1.smart-contracts.getContracts',
					'v1.daily-cw20-holder.getCw20HolderChangePercent',
				],
				// Route-level Express middlewares. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Middlewares
				// use: [swMiddleware],
				// Enable/disable parameter merging method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Disable-merging
				mergeParams: true,

				// Enable authentication. Implement the logic into `authenticate` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authentication
				authentication: false,

				// Enable authorization. Implement the logic into `authorize` method. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Authorization
				authorization: false,

				// The auto-alias feature allows you to declare your route alias directly in your services.
				// The gateway will dynamically build the full routes from service schema.
				autoAliases: true,

				// aliases: {
				// 	'GET /'(req: any, res: any) {
				// 		// console.log(swStats.getPromClient());
				// 		res.statusCode = 302;
				// 		res.setHeader('Location', '/api/dashboard/');
				// 		return res.end();
				// 	},
				// 	'GET /stats'(req: any, res: any) {
				// 		res.setHeader('Content-Type', 'application/json');
				// 		return res.end(JSON.stringify(swStats.getCoreStats()));
				// 	},
				// 	'GET /metrics'(req: any, res: any) {
				// 		res.setHeader('Content-Type', 'application/json');
				// 		return res.end(JSON.stringify(swStats.getPromStats()));
				// 	},
				// },
				/**
			 * Before call hook. You can check the request.
			 * @param {Context} ctx
			 * @param {Object} route
			 * @param {IncomingMessage} req
			 * @param {ServerResponse} res
			 * @param {Object} data
			onBeforeCall(ctx: Context<any,{userAgent: string}>,
				route: object, req: IncomingMessage, res: ServerResponse) {
				Set request headers to context meta
				ctx.meta.userAgent = req.headers["user-agent"];
			},
				*/

				/**
			 * After call hook. You can modify the data.
			 * @param {Context} ctx
			 * @param {Object} route
			 * @param {IncomingMessage} req
			 * @param {ServerResponse} res
			 * @param {Object} data
			 *
			 onAfterCall(ctx: Context, route: object, req: IncomingMessage, res: ServerResponse, data: object) {
			// Async function which return with Promise
			return doSomething(ctx, res, data);
		},
				*/

				// Calling options. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Calling-options
				callingOptions: {},

				bodyParsers: {
					json: {
						strict: false,
						limit: '1MB',
					},
					urlencoded: {
						extended: true,
						limit: '1MB',
					},
				},

				// Mapping policy setting. More info: https://moleculer.services/docs/0.14/moleculer-web.html#Mapping-policy
				mappingPolicy: Config.MAPPING_POLICY, // Available values: "all", "restrict"

				// Enable/disable logging
				logging: true,
			},
		],
		// Do not log client side errors (does not log an error response when the error.code is 400<=X<500)
		log4XXResponses: false,
		// Logging the request parameters. Set to any log level to enable it. E.g. "info"
		logRequestParams: 'info',
		// Logging the response data. Set to any log level to enable it. E.g. "info"
		logResponseData: null,
		// Serve assets from "public" folder
		assets: {
			folder: 'public',
			// Options to `server-static` module
			options: {},
		},
	},
})
export default class ApiService extends moleculer.Service {
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
