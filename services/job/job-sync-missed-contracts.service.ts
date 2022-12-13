import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { dbTransactionMixin } from '@Mixins/dbMixinMongoose';
import { queueConfig } from 'config/queue';
import { MSG_TYPE } from 'common/constant';
import RedisMixin from '../../mixins/redis/redis.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class SyncMissedContracts extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'sync-missed-contracts',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbTransactionMixin,
				new RedisMixin().start(),
			],
			queues: {
				'contract-from-block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);

						// @ts-ignore
						await this.handleJob(job.data.start);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	public async handleJob(start: number) {
		for (let i = start; i <= 8488226; i++) {
			this.logger.info('Block height', i);
			let transactions = await this.adapter.find({
				query: {
					'indexes.height': i,
				},
			});
			if (transactions.length > 0) {
				transactions = transactions.filter((item: any) =>
					item.tx.body.messages.find(
						(msg: any) =>
							msg['@type'] === MSG_TYPE.MSG_EXECUTE_CONTRACT ||
							msg['@type'] === MSG_TYPE.MSG_INSTANTIATE_CONTRACT,
					),
				);
				if (transactions.length > 0) {
					this.createJob(
						'contract.tx-handle',
						{
							listTx: transactions,
							chainId: process.env.CHAIN_ID,
						},
						{
							removeOnComplete: true,
							removeOnFail: {
								count: 10,
							},
						},
					);
				}
			}
		}
	}

	public async _start() {
		this.createJob(
			'contract-from-block',
			{ start: 7239924 },
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('contract-from-block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('contract-from-block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('contract-from-block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
