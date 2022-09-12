/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
import { Job } from 'bull';
import { IAttribute, IEvent, ITransaction } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { ObjectID, ObjectId } from 'bson';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { bech32 } from 'bech32';
const hash = require('tendermint/lib/hash');
export default class IndexTxService extends Service {
	private redisMixin = new RedisMixin().start();
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'indextx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'index.tx',
					},
				),
				dbTransactionMixin,
				this.redisMixin,
			],
			queues: {
				'index.tx': {
					concurrency: 10,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.lastId);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(lastId: string) {
		// let listTx = await this.adapter.find({
		// 	query: {
		// 		_id: {
		// 			$gt: new ObjectID('630b9f100000000000000000'),
		// 			// $lt: new ObjectID('630bf202acc31a0012577ffd'),
		// 		},
		// 	},
		// 	limit: 5000,
		// 	//@ts-ignore
		// 	sort: '-_id',
		// });
		let listTx = await this.adapter.find({
			query: { 'indexes.message_action': { $regex: /[_]/g } },
			limit: 5000,
		});
		this.logger.info(1);
		let bulkOps: any[] = [];
		listTx.forEach(async (tx: any) => {
			this.logger.info(tx._id.toString());
			const actions = tx.indexes.message_action;
			let newActions = actions.map((action: string) => {
				return action.replace(/\_/g, '.');
			});

			bulkOps.push({
				updateOne: {
					filter: { _id: tx._id },
					update: { $set: { 'indexes.message_action': newActions } },
				},
			});
			if (bulkOps.length === 500) {
				let result = await this.adapter.bulkWrite(bulkOps);
				this.logger.info(result);
				this.logger.info('done 500');
				bulkOps = [];
			}
		});
		if (bulkOps.length > 0) {
			let result = await this.adapter.bulkWrite(bulkOps);
			this.logger.info(result);
		}
		this.logger.info('done');
	}

	async _start() {
		// let operatorAddress = 'cosmosvaloper1c4k24jzduc365kywrsvf5ujz4ya6mwympnc4en';
		// const operator_address = data.operator_address;
		// const decodeAcc = bech32.decode(operatorAddress);
		// const wordsByte = bech32.fromWords(decodeAcc.words);
		// const account_address = bech32.encode('cosmos', bech32.toWords(wordsByte));

		// const operator_address = operatorAddress;
		// const decodeAcc = bech32.decode(operator_address.toString());
		// const wordsByte = bech32.fromWords(decodeAcc.words);
		// const account_address = bech32.encode('cosmos', bech32.toWords(wordsByte));
		// this.logger.info('account_address:', account_address);
		// this.redisClient = await this.getRedisClient();
		// this.createJob(
		// 	'index.tx',
		// 	{
		// 		lastId: '0',
		// 	},
		// 	{
		// 		removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
		// 	},
		// );

		let operatorHexAddress = 'B00D6A3D473A303E8058810754074F8106804767';

		const bytes = Buffer.from('nDxL1WxLTMVpt8sm2x4E8RxFKEtAXBL+rFcVr1fewVc=', 'base64');
		const operatorAddress = hash.tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
		this.logger.info('operatorAddress:', operatorAddress);

		this.getQueue('index.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('index.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('index.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
