/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import { sha256 } from 'js-sha256';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { BASE_64_ENCODE, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { ListTxCreatedParams, ListTxInBlockParams, TransactionHashParam } from 'types';
import { ITransaction } from 'entities';
import { parseCoins } from '@cosmjs/amino';
import { fromBase64, fromUtf8 } from '@cosmjs/encoding';
export default class HandleTransactionDelegateService extends Service {
	private redisMixin = new RedisMixin().start();
	private callApiMixin = new CallApiMixin().start();

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-transaction-delegate',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.transaction.delegate',
					},
				),
				this.redisMixin,
				this.callApiMixin,
			],
			queues: {
				'handle.transaction.delegate': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'list-tx.upsert-done': {
					handler: async (ctx: Context<ListTxCreatedParams, Record<string, unknown>>) => {
						const listTx = ctx.params.listTx;
						const chainId = ctx.params.chainId;

						this.logger.info(`Crawl list transaction: ${JSON.stringify(listTx)}`);
						if (listTx && listTx.length > 0) {
							this.createJob(
								'handle.transaction.delegate',
								{
									listTx: listTx,
								},
								{
									removeOnComplete: true,
									removeOnFail: {
										count: 10,
									},
								},
							);
						}
					},
				},
			},
		});
	}

	async handleJob(listTx: ITransaction[]) {
		let bulkOps = [];
		listTx.map((tx: ITransaction) => {
			//@ts-ignore
			let listAction = tx.indexes.message_action;
			let listTypeFilter = [
				MSG_TYPE.MSG_DELEGATE,
				MSG_TYPE.MSG_UNDELEGATE,
				MSG_TYPE.MSG_WITHDRAW_REWARDS,
				MSG_TYPE.MSG_REDELEGATE,
			];
			listAction.map((action: string) => {
				if (listTypeFilter.includes(action)) {
					let events = tx.tx_response.events;
					let sender: String | null = null;
					let amount = null;
					events.map((event) => {
						if (event.type == 'message') {
							const attributes = event.attributes;
							attributes.forEach((attribute) => {
								if (attribute.key == BASE_64_ENCODE.SENDER) {
									sender = attribute.value;
								}
							});
						}
					});
					if (sender) {
						events.map((event) => {
							if (event.type == 'coin_received') {
								const attributes = event.attributes;
								attributes.forEach((attribute) => {
									if (
										attribute.key == BASE_64_ENCODE.RECIPIENT &&
										attribute.value == sender
									) {
										amount = attribute.value.toString();
									}
								});
							}
						});
					}
					if (amount) {
						let coin = parseCoins(amount);
						bulkOps.push({
							updateOne: {
								filter: { address: fromUtf8(fromBase64(sender)) },
								update: { $inc: { 'validatorReward.': newActions } },
							},
						});
					}
				}
			});
		});
	}

	async _start() {
		this.redisClient = await this.getRedisClient();

		this.getQueue('handle.transaction.delegate').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('handle.transaction.delegate').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('handle.transaction.delegate').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
