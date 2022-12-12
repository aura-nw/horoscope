/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';

// eslint-disable-next-line @typescript-eslint/no-var-requires
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { Config } from '../../common';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
export default class CrawlTxService extends Service {
	private currentBlock = 0;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltx',
			version: 1,
			mixins: [
				queueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.block',
					},
				),
				new CallApiMixin().start(),
				new RedisMixin().start(),
				dbTransactionMixin,
			],
		});
	}

	public async _start() {
		const listAddress: any[] = [123];
		const url = ['https://lcd.euphoria.aura.network'];
		const fromBlock = 856856;
		const toBlock = 880661;

		const listResult: any[] = [];
		// Let query1 = {
		//     "tx_response.height": {$lte: toBlock, $gte: fromBlock},
		//     "custom_info.chain_id":
		//     'tx_response.events': {
		//         $elemMatch: {
		//             Type: 'transfer',
		//             'attributes.key': toBase64(toUtf8('sender')),
		//             'attributes.value': toBase64(toUtf8('abc')),
		//         },
		//     },
		// }

		await listAddress.forEach(async (address) => {
			const query1 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				'indexes.transfer_sender': address,
			};
			const query2 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				'indexes.transfer_sender': address,
				'indexes.message_action': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
			};
			const query3 = {
				'tx_response.height': { $lte: toBlock, $gte: fromBlock },
				'custom_info.chain_id': 'euphoria-1',
				'indexes.transfer_sender': address,
				'indexes.message_action': '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward',
			};
			const query4 = {
				'tx_response.height': { $lte: toBlock, $gte: 843044 },
				'custom_info.chain_id': 'euphoria-1',
				'indexes.transfer_sender': address,
				'indexes.message_action': '/cosmos.gov.v1beta1.MsgVote',
				'indexes.proposal_vote_proposal_id': '7',
			};

			// Let [result1, result2, result3, result4] = await Promise.all([
			// 	This.adapter.count({ query: query1 }),
			// 	This.adapter.count({ query: query2 }),
			// 	This.adapter.count({ query: query3 }),
			// 	This.adapter.count({ query: query4 }),
			// 	// this.adapter.count({ query: query5 }),
			// ]);
			// Let element = {
			// 	Address: address,
			// 	NoTx: result1,
			// 	NoRedelegate: result2,
			// 	NoWithdraw: result3,
			// };
			// ListResult.push(element);
			// This.logger.info(`${address},${result1},${result2},${result3},${result4}`);

			const queryDelegate = [
				{
					$match: {
						'custom_info.chain_id': 'euphoria-1',
						'indexes.message_action': '/cosmos.staking.v1beta1.MsgDelegate',
						'indexes.transfer_sender': address,
					},
				},
				{
					$unwind: {
						path: '$indexes.delegate_validator',
					},
				},
				{
					$group: {
						_id: {
							chain_id: '$custom_info.chain_id',
							indexes_transfer_sender: '$indexes.transfer_sender',
						},
						indexes_validator: {
							$push: '$indexes.delegate_validator',
						},
					},
				},
			];
			const queryRedelegate = [
				{
					$match: {
						'custom_info.chain_id': 'euphoria-1',
						'indexes.message_action': '/cosmos.staking.v1beta1.MsgBeginRedelegate',
						'indexes.transfer_sender': address,
					},
				},
				{
					$unwind: {
						path: '$indexes.redelegate_destination_validator',
					},
				},
				{
					$group: {
						_id: {
							chain_id: '$custom_info.chain_id',
							indexes_transfer_sender: '$indexes.transfer_sender',
						},
						indexes_redelegate_dest: {
							$push: '$indexes.redelegate_destination_validator',
						},
					},
				},
			];

			const [resultDelegate, resultRedelegate] = await Promise.all([
				this.adapter.aggregate(queryDelegate),
				this.adapter.aggregate(queryRedelegate),
			]);
			const listValidator: any[] = [];
			if (resultDelegate && resultDelegate.length > 0) {
				listValidator.push(...resultDelegate[0].indexes_validator);
			}
			if (resultRedelegate && resultRedelegate.length > 0) {
				listValidator.push(...resultRedelegate[0].indexes_redelegate_dest);
			}

			const onlyUnique = (value: any, index: any, self: any) => self.indexOf(value) === index;
			const listValidatorUnique = listValidator.filter(onlyUnique);
			this.logger.info(`${address},${listValidatorUnique.length}`);
		});

		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
	async sleep(ms: any) {
		return new Promise((resolve) => {
			setTimeout(resolve, ms);
		});
	}
}
