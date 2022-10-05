import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountInfoEntity, ITransaction, Rewards } from '../../entities';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class CrawlAccountClaimedRewardsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private redisMixin = new RedisMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountClaimedRewards',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbAccountInfoMixin,
				this.callApiMixin,
				this.redisMixin,
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
				'account-info.upsert-claimed-rewards': {
					handler: (ctx: Context<CrawlAccountClaimedRewardsService>) => {
						this.logger.debug(`Crawl account total claimed rewards`);
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
								listTx,
								chainId: ctx.params.chainId,
							},
							{
								removeOnComplete: true,
								removeOnFail: {
									count: 10,
								},
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(listTx: any[], chainId: string) {
		let listAccounts: AccountInfoEntity[] = [],
			listUpdateQueries: any[] = [];
		chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		const network = LIST_NETWORK.find((x) => x.chainId == chainId);
		if (network && network.databaseName) {
			this.adapter.useDb(network.databaseName);
		}
		try {
			for (let tx of listTx) {
				const userAddress = tx.tx.body.messages[0].delegator_address;
				let account: AccountInfoEntity = await this.adapter.findOne({
					address: userAddress,
					'custom_info.chain_id': chainId,
				});
				if (!account) {
					account = {} as AccountInfoEntity;
					account.address = userAddress;
					account.account_claimed_rewards = [] as Rewards[];
				}
				switch (tx.tx.body.messages[0]['@type']) {
					case MSG_TYPE.MSG_DELEGATE:
						const validatorAddress = tx.tx.body.messages[0].validator_address;
						const indexReward = tx.tx_response.logs[0].events
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED)
							.attributes.findIndex((x: any) => x.value === userAddress);
						const claimedReward = tx.tx_response.logs[0].events.find(
							(x: any) => x.type === CONST_CHAR.COIN_RECEIVED,
						).attributes[indexReward + 1].value;
						let amount = '';
						if (claimedReward !== '') amount = claimedReward.match(/\d+/g)[0];
						if (
							account.account_claimed_rewards &&
							amount !== '' &&
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === validatorAddress,
							)
						) {
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === validatorAddress,
							)!.amount = (
								parseInt(
									account.account_claimed_rewards
										.find((x: any) => x.validator_address === validatorAddress)!
										.amount.toString(),
									10,
								) + parseInt(amount, 10)
							).toString();
						} else {
							account.account_claimed_rewards.push({
								validator_address: validatorAddress,
								denom:
									claimedReward !== ''
										? claimedReward.match(/[a-zA-Z]+/g)[0]
										: '',
								amount,
							} as Rewards);
						}
						break;
					case MSG_TYPE.MSG_REDELEGATE:
						const valSrcAddress = tx.tx.body.messages[0].validator_src_address;
						const valDstAddress = tx.tx.body.messages[0].validator_dst_address;
						const coinReceived = tx.tx_response.logs[0].events.find(
							(x: any) => x.type === CONST_CHAR.COIN_RECEIVED,
						).attributes;
						if (coinReceived.length === 2) {
							const srcClaimedReward = coinReceived.find(
								(x: any) => x.key === CONST_CHAR.AMOUNT,
							).value;
							let srcAmount = '';
							if (srcClaimedReward !== '')
								srcAmount = srcClaimedReward.match(/\d+/g)[0];
							if (
								account.account_claimed_rewards &&
								srcAmount !== '' &&
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valSrcAddress,
								)
							) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valSrcAddress,
								)!.amount = (
									parseInt(
										account.account_claimed_rewards
											.find(
												(x: any) => x.validator_address === valSrcAddress,
											)!
											.amount.toString(),
										10,
									) + parseInt(srcAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valSrcAddress,
									denom:
										srcClaimedReward !== ''
											? srcClaimedReward.match(/[a-zA-Z]+/g)[0]
											: '',
									amount: srcAmount,
								} as Rewards);
							}
						} else if (coinReceived.length > 2) {
							const srcClaimedReward = coinReceived[1].value;
							const dstClaimedReward = coinReceived[3].value;
							let srcAmount = '';
							if (srcClaimedReward !== '')
								srcAmount = srcClaimedReward.match(/\d+/g)[0];
							let dstAmount = '';
							if (dstClaimedReward !== '')
								dstAmount = dstClaimedReward.match(/\d+/g)[0];
							if (
								account.account_claimed_rewards &&
								srcAmount !== '' &&
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valSrcAddress,
								)
							) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valSrcAddress,
								)!.amount = (
									parseInt(
										account.account_claimed_rewards
											.find(
												(x: any) => x.validator_address === valSrcAddress,
											)!
											.amount.toString(),
										10,
									) + parseInt(srcAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valSrcAddress,
									denom:
										srcClaimedReward !== ''
											? srcClaimedReward.match(/[a-zA-Z]+/g)[0]
											: '',
									amount: srcAmount,
								} as Rewards);
							}
							if (
								account.account_claimed_rewards &&
								dstAmount !== '' &&
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valDstAddress,
								)
							) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valDstAddress,
								)!.amount = (
									parseInt(
										account.account_claimed_rewards
											.find(
												(x: any) => x.validator_address === valDstAddress,
											)!
											.amount.toString(),
										10,
									) + parseInt(dstAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valDstAddress,
									denom:
										dstClaimedReward !== ''
											? dstClaimedReward.match(/[a-zA-Z]+/g)[0]
											: '',
									amount: dstAmount,
								} as Rewards);
							}
						}
						break;
					case MSG_TYPE.MSG_UNDELEGATE:
						const undelegateValAddress = tx.tx.body.messages[0].validator_address;
						const undelegateIndexReward = tx.tx_response.logs[0].events
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED)
							.attributes.findIndex((x: any) => x.value === userAddress);
						const undelegateClaimedReward = tx.tx_response.logs[0].events.find(
							(x: any) => x.type === CONST_CHAR.COIN_RECEIVED,
						).attributes[undelegateIndexReward + 1].value;
						let undelegateAmount = '';
						if (undelegateClaimedReward !== '')
							undelegateAmount = undelegateClaimedReward.match(/\d+/g)[0];
						if (
							account.account_claimed_rewards &&
							undelegateAmount !== '' &&
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === undelegateValAddress,
							)
						) {
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === undelegateValAddress,
							)!.amount = (
								parseInt(
									account.account_claimed_rewards
										.find(
											(x: any) =>
												x.validator_address === undelegateValAddress,
										)!
										.amount.toString(),
									10,
								) + parseInt(undelegateAmount, 10)
							).toString();
						} else {
							account.account_claimed_rewards.push({
								validator_address: undelegateValAddress,
								denom:
									undelegateClaimedReward !== ''
										? undelegateClaimedReward.match(/[a-zA-Z]+/g)[0]
										: '',
								amount: undelegateAmount,
							} as Rewards);
						}
						break;
					case MSG_TYPE.MSG_WITHDRAW_REWARDS:
						tx.tx.body.messages.map((msg: any) => {
							const log = tx.tx_response.logs.find(
								(log: any) =>
									log.events
										.find(
											(event: any) =>
												event.type === CONST_CHAR.WITHDRAW_REWARDS,
										)
										.attributes.find(
											(attr: any) => attr.key === CONST_CHAR.VALIDATOR,
										).value === msg.validator_address,
							);
							const claimedReward = log.events
								.find((event: any) => event.type === CONST_CHAR.WITHDRAW_REWARDS)
								.attributes.find(
									(attr: any) => attr.key === CONST_CHAR.AMOUNT,
								).value;
							let amount = '';
							if (claimedReward !== '') amount = claimedReward.match(/\d+/g)[0];
							if (
								account.account_claimed_rewards &&
								amount !== '' &&
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === msg.validator_address,
								)
							) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === msg.validator_address,
								)!.amount = (
									parseInt(
										account.account_claimed_rewards
											.find(
												(x: any) =>
													x.validator_address === msg.validator_address,
											)!
											.amount.toString(),
										10,
									) + parseInt(amount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: msg.validator_address,
									denom:
										claimedReward !== ''
											? claimedReward.match(/[a-zA-Z]+/g)[0]
											: '',
									amount,
								} as Rewards);
							}
						});
						break;
				}
				listAccounts.push(account);
			}
			const network = LIST_NETWORK.find((x) => x.chainId == chainId);
			if (network && network.databaseName) {
				this.adapter.useDb(network.databaseName);
			}
			listAccounts.map((element) => {
				if (element._id)
					listUpdateQueries.push(
						this.adapter.updateById(element._id, {
							$set: { account_claimed_rewards: element.account_claimed_rewards },
						}),
					);
				else {
					const item: AccountInfoEntity = new JsonConvert().deserializeObject(
						element,
						AccountInfoEntity,
					);
					item.custom_info = {
						chain_id: chainId,
						chain_name: chain ? chain.chainName : '',
					};
					listUpdateQueries.push(this.adapter.insert(item));
				}
			});
			await Promise.all(listUpdateQueries);
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
		this.redisClient = await this.getRedisClient();
		this.getQueue('crawl.account-claimed-rewards').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-claimed-rewards').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.account-claimed-rewards').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
