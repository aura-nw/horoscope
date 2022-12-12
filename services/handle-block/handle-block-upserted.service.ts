/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ListBlockCreatedParams } from 'types';
import { IBlock, ITransaction } from 'entities';
import RedisMixin from '../../mixins/redis/redis.mixin';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbBlockMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleBlockUpsertedService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-block-upserted',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbBlockMixin,
				new CallApiMixin().start(),
				new RedisMixin().start(),
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
									listBlock,
									chainId,
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
		const list = await Promise.all(
			listBlock.map(async (block: IBlock) => {
				const hexAddress = block.block?.header?.proposer_address;
				const result: any = await this.broker.call('v1.crawlValidator.find', {
					query: {
						// eslint-disable-next-line camelcase
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
								// eslint-disable-next-line camelcase
								validator_name: nameValidator,
								// eslint-disable-next-line camelcase
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
				const result = await this.adapter.bulkWrite(list);
				this.logger.info('result : ', result);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}

	public async _start() {
		this.redisClient = await this.getRedisClient();

		this.getQueue('add-proposer').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('add-proposer').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('add-proposer').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
