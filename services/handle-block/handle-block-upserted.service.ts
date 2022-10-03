/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Context, Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import RedisMixin from '../../mixins/redis/redis.mixin';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { BASE_64_ENCODE, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { ListBlockCreatedParams } from 'types';
import { IBlock, ITransaction } from 'entities';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import QueueConfig from '../../config/queue';

export default class HandleBlockUpsertedService extends Service {
	private redisMixin = new RedisMixin().start();
	private callApiMixin = new CallApiMixin().start();
	private dbBlockMixin = dbBlockMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-block-upserted',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.redisMixin,
				this.callApiMixin,
				this.dbBlockMixin,
			],
			queues: {
				'add-proposer': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJobAddProposer(job.data.listBlock);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'list-block.upserted': {
					handler: async (
						ctx: Context<ListBlockCreatedParams, Record<string, unknown>>,
					) => {
						const listBlock = ctx.params.listBlock;
						const chainId = ctx.params.chainId;

						if (listBlock && listBlock.length > 0) {
							this.createJob(
								'add-proposer',
								{
									listBlock: listBlock,
									chainId: chainId,
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

	async handleJobAddProposer(listBlock: IBlock[]) {
		let list = await Promise.all(
			listBlock.map(async (block: IBlock) => {
				let hexAddress = block.block?.header?.proposer_address;
				let result: any = await this.broker.call('v1.crawlValidator.find', {
					query: {
						'custom_info.chain_id': Config.CHAIN_ID,
						consensus_hex_address: hexAddress,
					},
				});
				const nameValidator: string = result[0].description.moniker;
				const operatorAddress: string = result[0].operator_address;
				return {
					updateOne: {
						filter: { 'block_id.hash': block.block_id?.hash },
						update: {
							$set: {
								validator_name: nameValidator,
								operator_address: operatorAddress,
							},
						},
					},
				};
			}),
		);
		if (list.length > 0) {
			this.logger.debug(JSON.stringify(list));

			try {
				let result = await this.adapter.bulkWrite(list);
				this.logger.info(`result : `, result);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}

	async _start() {
		this.redisClient = await this.getRedisClient();

		this.getQueue('add-proposer').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('add-proposer').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('add-proposer').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'add-proposer' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
