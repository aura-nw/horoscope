/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
// import createService from 'moleculer-bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { BlockResponseFromLCD, ResponseFromRPC } from '../../types';
import { IBlock } from 'entities';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
export default class CrawlTxService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private redisMixin = new RedisMixin().start();

	private currentBlock = 0;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.block',
					},
				),
				this.callApiMixin,
				this.redisMixin,
				dbTransactionMixin,
			],
		});
	}

	async _start() {
		let listAddress = ['abc'];
		let url = ['https://lcd.euphoria.aura.network'];
		let fromBlock = 689829;
		let toBlock = 704360;
		//704360
		let listResult: any[] = [];
		// let query1 = {
		//     "tx_response.height": {$lte: toBlock, $gte: fromBlock},
		//     "custom_info.chain_id":"euphoria-1",
		//     'tx_response.events': {
		//         $elemMatch: {
		//             type: 'transfer',
		//             'attributes.key': toBase64(toUtf8('sender')),
		//             'attributes.value': toBase64(toUtf8('abc')),
		//         },
		//     },
		// }

		await listAddress.forEach(async (address) => {
			let query1 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				'tx_response.events': {
					$elemMatch: {
						type: 'transfer',
						'attributes.key': toBase64(toUtf8('sender')),
						'attributes.value': toBase64(toUtf8(address)),
					},
				},
			};
			let query2 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				$and: [
					{
						'tx_response.events': {
							$elemMatch: {
								type: 'transfer',
								'attributes.key': toBase64(toUtf8('sender')),
								'attributes.value': toBase64(toUtf8(address)),
							},
						},
					},
					{
						'tx_response.events': {
							$elemMatch: {
								type: 'message',
								'attributes.key': toBase64(toUtf8('action')),
								'attributes.value': toBase64(
									toUtf8('/cosmos.staking.v1beta1.MsgBeginRedelegate'),
								),
							},
						},
					},
				],
			};
			let query3 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				$and: [
					{
						'tx_response.events': {
							$elemMatch: {
								type: 'transfer',
								'attributes.key': toBase64(toUtf8('sender')),
								'attributes.value': toBase64(toUtf8(address)),
							},
						},
					},
					{
						'tx_response.events': {
							$elemMatch: {
								type: 'message',
								'attributes.key': toBase64(toUtf8('action')),
								'attributes.value': toBase64(
									toUtf8(
										'/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
									),
								),
							},
						},
					},
				],
			};

			//case 1
			// let pathAllSendTx = /cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC
			// let pathRedelegateTx = /cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=message.action='/cosmos.staking.v1beta1.MsgBeginRedelegate'&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC
			// let pathWithdraw = /cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=message.action='/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC;

			// let [result1, result2, result3] = await Promise.all([
			//     this.callApiFromDomain(
			//         url,
			//         pathAllSendTx,
			//     ),
			//     this.callApiFromDomain(
			//         url,
			//         pathRedelegateTx,
			//     ),this.callApiFromDomain(
			//         url,
			//         pathWithdraw,
			//     )
			// ])

			// let element = {
			//     address: address,
			//     noTx: result1.pagination.total,
			//     noRedelegate : result2.pagination.total,
			//     noWithdraw: result3.pagination.total,
			// }
			// listResult.push(element);
			// this.logger.info(result1.pagination.total,' ',result2.pagination.total,' ',result3.pagination.total,' ');

			//case 2
			this.logger.info(query1);
			// let result1: number = await this.adapter.count({query: query1});
			// let result2: number = await this.adapter.count({query: query2});
			// let result3: number = await this.adapter.count({query: query3});
			let [result1, result2, result3] = await Promise.all([
				this.adapter.count({ query: query1 }),
				this.adapter.count({ query: query2 }),
				this.adapter.count({ query: query3 }),
			]);
			let element = {
				address: address,
				noTx: result1,
				noRedelegate: result2,
				noWithdraw: result3,
			};
			listResult.push(element);
			this.logger.info(`${address},${result1},${result2},${result3}`);
		});
		this.logger.info(JSON.stringify(listResult));

		return super._start();
	}
	async sleep(ms: any) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
}
