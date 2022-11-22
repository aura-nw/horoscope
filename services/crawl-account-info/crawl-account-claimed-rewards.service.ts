import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountInfoEntity, ITransaction, Rewards } from '../../entities';
import { QueueConfig } from '../../config/queue';
const QueueService = require('moleculer-bull');

export default class CrawlAccountClaimedRewardsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;
	private listMessageAction = [
		MSG_TYPE.MSG_DELEGATE,
		MSG_TYPE.MSG_REDELEGATE,
		MSG_TYPE.MSG_UNDELEGATE,
		MSG_TYPE.MSG_WITHDRAW_REWARDS,
		MSG_TYPE.MSG_EXEC,
	];

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlAccountClaimedRewards',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbAccountInfoMixin,
				this.callApiMixin,
			],
			queues: {
				'crawl.account-claimed-rewards': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_CLAIMED_REWARDS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx, job.data.chainId);
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
										type === MSG_TYPE.MSG_WITHDRAW_REWARDS ||
										type === MSG_TYPE.MSG_EXEC
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
		this.logger.info(`Handle Txs: ${JSON.stringify(listTx)}`);
		if (listTx.length > 0) {
			let listAccounts: AccountInfoEntity[] = [],
				listUpdateQueries: any[] = [];
			chainId = chainId !== '' ? chainId : Config.CHAIN_ID;
			const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
			for (let tx of listTx) {
				if (tx.tx_response.code !== 0) continue;

				await Promise.all(
					tx.tx.body.messages
						.filter(
							(msg: any) =>
								this.listMessageAction.includes(msg['@type']) &&
								tx.tx_response.code === 0,
						)
						.map(async (msg: any, index: any) => {
							const userAddress = msg.delegator_address;

							try {
								if (msg['@type'] === MSG_TYPE.MSG_EXEC) {
									await Promise.all(
										msg.msgs.map(async (m: any) => {
											let insertAcc = await this.handleStakeRewards(
												m,
												index,
												tx.tx_response.logs,
												userAddress,
												chainId,
											);
											if (insertAcc) listAccounts.push(insertAcc);
										}),
									);
								} else {
									let insertAcc = await this.handleStakeRewards(
										msg,
										index,
										tx.tx_response.logs,
										userAddress,
										chainId,
									);
									if (insertAcc) listAccounts.push(insertAcc);
								}
							} catch (error) {
								this.logger.error(error);
								throw error;
							}
						}),
				);
			}

			try {
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
				throw error;
			}
		}
	}

	async handleStakeRewards(
		msg: any,
		index: any,
		logs: any,
		userAddress: string,
		chainId: string,
	) {
		if (!userAddress) {
			userAddress = msg.delegator_address;
		}
		let account: AccountInfoEntity;
		try {
			account = await this.adapter.findOne({
				address: userAddress,
				'custom_info.chain_id': chainId,
			});
		} catch (error) {
			this.logger.error(error);
			throw error;
		}
		if (!account) {
			account = {} as AccountInfoEntity;
			account.address = userAddress;
			account.account_claimed_rewards = [] as Rewards[];
		}

		switch (msg['@type']) {
			case MSG_TYPE.MSG_DELEGATE:
				const validatorAddress = msg.validator_address;
				let amount = '0';
				let delegateReward = logs[index].events.find((x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS);
				if (delegateReward)
					try {
						amount = delegateReward.attributes.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						amount = '0';
					}
				let reward = account.account_claimed_rewards.find(
					(x: any) => x.validator_address === validatorAddress,
				);
				if (reward) {
					account.account_claimed_rewards.find(
						(x: any) => x.validator_address === validatorAddress,
					)!.amount = (
						parseInt(reward.amount.toString(), 10) + parseInt(amount, 10)
					).toString();
				} else {
					account.account_claimed_rewards.push({
						validator_address: validatorAddress,
						denom: Config.NETWORK_DENOM,
						amount,
					} as Rewards);
				}
				break;
			case MSG_TYPE.MSG_REDELEGATE:
				let redelegateReward = logs[index].events.find((x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS);
				if (redelegateReward) {
					let redelegateAmount = '0';
					try {
						redelegateAmount = redelegateReward.attributes.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						redelegateAmount = '0';
					}
					let redelegateVal = redelegateReward.attributes.find((x: any) => x.key === CONST_CHAR.VALIDATOR).value;
					let srcReward = account.account_claimed_rewards.find(
						(x: any) => x.validator_address === redelegateVal,
					);
					if (srcReward) {
						account.account_claimed_rewards.find(
							(x: any) => x.validator_address === redelegateVal,
						)!.amount = (
							parseInt(srcReward.amount.toString(), 10) + parseInt(redelegateAmount, 10)
						).toString();
					} else {
						account.account_claimed_rewards.push({
							validator_address: redelegateVal,
							denom: Config.NETWORK_DENOM,
							amount: redelegateAmount,
						} as Rewards);
					}

					if (redelegateReward.attributes.length > 2) {
						let redelegateAmount = redelegateReward.attributes[2].value.match(/\d+/g)[0];
						let redelegateVal = redelegateReward.attributes[3].value;
						let srcReward = account.account_claimed_rewards.find(
							(x: any) => x.validator_address === redelegateVal,
						);
						if (srcReward) {
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === redelegateVal,
							)!.amount = (
								parseInt(srcReward.amount.toString(), 10) + parseInt(redelegateAmount, 10)
							).toString();
						} else {
							account.account_claimed_rewards.push({
								validator_address: redelegateVal,
								denom: Config.NETWORK_DENOM,
								amount: redelegateAmount,
							} as Rewards);
						}
					}
				}
				break;
			case MSG_TYPE.MSG_UNDELEGATE:
				const undelegateValAddress = msg.validator_address;
				let undelegateAmount = '0';
				let undelegateReward = logs[index].events.find((x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS);
				if (undelegateReward)
					try {
						undelegateAmount = delegateReward.attributes.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						undelegateAmount = '0'
					}
				let undeleReward = account.account_claimed_rewards.find(
					(x: any) => x.validator_address === undelegateValAddress,
				);
				if (undeleReward) {
					account.account_claimed_rewards.find(
						(x: any) => x.validator_address === undelegateValAddress,
					)!.amount = (
						parseInt(undeleReward.amount.toString(), 10) + parseInt(undelegateAmount, 10)
					).toString();
				} else {
					account.account_claimed_rewards.push({
						validator_address: undelegateValAddress,
						denom: Config.NETWORK_DENOM,
						amount: undelegateAmount,
					} as Rewards);
				}
				break;
			case MSG_TYPE.MSG_WITHDRAW_REWARDS:
				const log = logs[index];
				let amountWithdraw = '0';
				let claimedRewardWithdraw = log.events.find((event: any) => event.type === CONST_CHAR.WITHDRAW_REWARDS);
				if (claimedRewardWithdraw)
					try {
						amountWithdraw = claimedRewardWithdraw.attributes.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						amountWithdraw = '0'
					}
				let rewardWithdraw = account.account_claimed_rewards.find(
					(x: any) => x.validator_address === msg.validator_address,
				);
				if (rewardWithdraw) {
					account.account_claimed_rewards.find(
						(x: any) => x.validator_address === msg.validator_address,
					)!.amount = (
						parseInt(rewardWithdraw.amount.toString(), 10) +
						parseInt(amountWithdraw, 10)
					).toString();
				} else {
					account.account_claimed_rewards.push({
						validator_address: msg.validator_address,
						denom: Config.NETWORK_DENOM,
						amount: amountWithdraw,
					} as Rewards);
				}
				break;
		}
		return account;
	}

	async _start() {
		this.getQueue('crawl.account-claimed-rewards').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-claimed-rewards').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.account-claimed-rewards').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
