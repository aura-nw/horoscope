import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountClaimedRewardsMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { ITransaction, UnbondingResponse } from '../../entities';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams, ListTxCreatedParams } from '../../types';
const QueueService = require('moleculer-bull');

export default class CrawlAccountClaimedRewardsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountClaimedRewardsMixin = dbAccountClaimedRewardsMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountClaimedRewards',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.account-claimed-rewards',
					},
				),
				this.dbAccountClaimedRewardsMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-claimed-rewards': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_CLAIMED_REWARDS, 10),
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.listTx, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'list-tx.upsert': {
					handler: (ctx: Context<ListTxCreatedParams>) => {
						this.logger.debug(`Handle address`);
						const listTx = ctx.params.listTx.filter((tx: ITransaction) => {
							function checkValidClaimRewardsTx(tx: ITransaction) {
								const listMsg = tx.tx.body.messages;
								const listMsgType = listMsg.map((msg: any) => {
									return msg['@type'];
								});
								function checkEqualTypeClaimRewards(type: string) {
									if (
										type === MSG_TYPE.MSG_DELEGATE ||
										type === MSG_TYPE.MSG_REDELEGATE ||
										type === MSG_TYPE.MSG_UNDELEGATE ||
										type === MSG_TYPE.MSG_WITHDRAW_REWARDS
									) {
										return true;
									}
									return false;
								}
								let result = listMsgType.find(checkEqualTypeClaimRewards);
								if (result) {
									return true;
								}
								return false;
							}
							if (checkValidClaimRewardsTx(tx)) {
								return true;
							}
							return false;
						});
						this.createJob(
							'crawl.account-claimed-rewards',
							{
								listTx: listTx,
								source: ctx.params.source,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listTx: ITransaction[], chainId: string) {
		try {
			listTx.map((tx: ITransaction) => {
				this.logger.info(tx);
			});
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.getQueue('crawl.account-unbonds').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-unbonds').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-unbonds').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
