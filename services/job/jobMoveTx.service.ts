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
import { IBlock, ITransaction, TransactionEntity } from '../../entities';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';

export default class MoveTxService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'movetx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'move.tx',
					},
				),
				dbTransactionMixin,
			],
			queues: {
				'move.tx': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.initEnv();
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async initEnv() {}
	async handleJob() {
		const listTx: any[] = await this.adapter.find({
			// query: ,
			limit: 1,
			offset: 0,
			// @ts-ignore
			// sort: '-block.header.height',
			sort: { _id: 1 },
		});
		let jsonConvert = new JsonConvert();
		const listTxEntity: ITransaction[] = jsonConvert.deserializeArray(
			listTx,
			TransactionEntity,
		);
		const listId = listTxEntity.map((tx: ITransaction) => tx._id);
		try {
			let resultInsert = await this.broker.call('v1.transaction-aggregate.insert', {
				entities: listTxEntity,
			});

			listTxEntity.map((tx: ITransaction) => {
				this.adapter.removeMany({ _id: tx._id });
			});
			// listId.map((_id) => {
			// 	this.adapter.removeById(_id);
			// });
			// let resultRemove = await this.adapter.removeMany({
			// 	id: {
			// 		$in: listId,
			// 	},
			// });
			this.logger.info(`resultInsert: ${JSON.stringify(resultInsert)}`);
			// this.logger.info(`resultRemove: ${JSON.stringify(resultRemove)}`);
		} catch (error) {
			this.logger.error(`error: ${JSON.stringify(error)}`);
		}
	}

	async _start() {
		this.createJob(
			'move.tx',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_MOVE_TX, 10),
				},
			},
		);
		this.getQueue('move.tx').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('move.tx').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('move.tx').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
