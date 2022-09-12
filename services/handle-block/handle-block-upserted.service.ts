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
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'handle.block.upserted',
					},
				),
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
				// let foundBlock = await this.adapter.findOne({
				// 	'block_id.hash': block.block_id?.hash,
				// 	'custom_info.chain_id': Config.CHAIN_ID,
				// });
				const nameValidator: string = result[0].description.moniker;
				const operatorAddress: string = result[0].operator_address;
				// let res = await this.adapter.updateById(foundBlock._id, {
				// 	$set: {
				// 		name_validator: nameValidator,
				// 		operator_address: operatorAddress,
				// 	},
				// });
				// this.logger.info(res);
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
		// let bulkOps = await Promise.all(list);
		if (list.length > 0) {
			this.logger.info(JSON.stringify(list));

			try {
				let result = await this.adapter.bulkWrite(list);
				this.logger.info(`result : ${result.length}`, result);
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
		return super._start();
	}
}
