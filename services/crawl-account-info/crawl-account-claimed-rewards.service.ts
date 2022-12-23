/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Job } from 'bull';
import { Service, ServiceBroker } from 'moleculer';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { CONST_CHAR, MSG_TYPE } from '../../common/constant';
import { AccountInfoEntity, ITransaction, Rewards } from '../../entities';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountClaimedRewardsService extends Service {
	private _listMessageAction = [
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
				queueService(queueConfig.redis, queueConfig.opts),
				dbAccountInfoMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.account-claimed-rewards': {
					concurrency: parseInt(Config.CONCURRENCY_ACCOUNT_CLAIMED_REWARDS, 10),
					async process(job: Job) {
						job.progress(10);
						const checkValidClaimRewardsTx = (tx: ITransaction) => {
							const listMsg = tx.tx.body.messages;
							const listMsgType = listMsg.map((msg: any) => msg['@type']);
							const checkEqualTypeClaimRewards = (type: string) => {
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
							};
							const result = listMsgType.find(checkEqualTypeClaimRewards);
							if (result) {
								return true;
							}
							return false;
						};
						const listTx = job.data.listTx.filter((tx: ITransaction) => {
							if (checkValidClaimRewardsTx(tx)) {
								return true;
							}
							return false;
						});
						// @ts-ignore
						await this.handleJob(listTx);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	public async handleJob(listTx: any[]) {
		this.logger.info(`Handle Txs: ${JSON.stringify(listTx)}`);
		if (listTx.length > 0) {
			const listAccounts: AccountInfoEntity[] = [];
			const listUpdateQueries: any[] = [];
			for (const tx of listTx) {
				if (tx.tx_response.code !== 0) {
					continue;
				}

				const messages = tx.tx.body.messages.filter(
					(msg: any) =>
						// eslint-disable-next-line no-underscore-dangle
						this._listMessageAction.includes(msg['@type']) && tx.tx_response.code === 0,
				);
				for (let index = 0; index < messages.length; index++) {
					const userAddress = messages[index].delegator_address;

					try {
						if (messages[index]['@type'] === MSG_TYPE.MSG_EXEC) {
							for (const m of messages[index]) {
								const acc = await this.handleStakeRewards(
									m,
									index,
									tx.tx_response.logs,
									userAddress,
									listAccounts,
								);
								if (acc) {
									listAccounts.push(acc);
								}
							}
						} else {
							const acc = await this.handleStakeRewards(
								messages[index],
								index,
								tx.tx_response.logs,
								userAddress,
								listAccounts,
							);
							if (acc) {
								listAccounts.push(acc);
							}
						}
					} catch (error) {
						this.logger.error(error);
						throw error;
					}
				}
			}

			try {
				listAccounts.map((element) => {
					/* eslint-disable no-underscore-dangle, camelcase */
					listUpdateQueries.push(
						this.adapter.updateById(element._id, {
							$set: { account_claimed_rewards: element.account_claimed_rewards },
						}),
					);
				});
				await Promise.all(listUpdateQueries);
			} catch (error) {
				this.logger.error(error);
				throw error;
			}
		}
	}

	public async handleStakeRewards(
		msg: any,
		index: any,
		logs: any,
		userAddress: string,
		listAccounts: any,
	) {
		if (!userAddress) {
			userAddress = msg.delegator_address;
		}
		let account = listAccounts.find((acc: any) => acc.address === userAddress);
		if (!account) {
			try {
				account = await this.adapter.findOne({
					address: userAddress,
				});
			} catch (error) {
				this.logger.error(error);
				throw error;
			}
		}

		switch (msg['@type']) {
			case MSG_TYPE.MSG_DELEGATE:
				const validatorAddress = msg.validator_address;
				let amount = '0';
				const delegateReward = logs[index].events.find(
					(x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS,
				);
				if (delegateReward) {
					try {
						amount = delegateReward.attributes
							.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						amount = '0';
					}
				}
				const reward = account.account_claimed_rewards.find(
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
				const redelegateReward = logs[index].events.find(
					(x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS,
				);
				if (redelegateReward) {
					let redelegateAmount = '0';
					try {
						redelegateAmount = redelegateReward.attributes
							.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						redelegateAmount = '0';
					}
					const redelegateVal = redelegateReward.attributes.find(
						(x: any) => x.key === CONST_CHAR.VALIDATOR,
					).value;
					const srcReward = account.account_claimed_rewards.find(
						(x: any) => x.validator_address === redelegateVal,
					);
					if (srcReward) {
						account.account_claimed_rewards.find(
							(x: any) => x.validator_address === redelegateVal,
						)!.amount = (
							parseInt(srcReward.amount.toString(), 10) +
							parseInt(redelegateAmount, 10)
						).toString();
					} else {
						account.account_claimed_rewards.push({
							validator_address: redelegateVal,
							denom: Config.NETWORK_DENOM,
							amount: redelegateAmount,
						} as Rewards);
					}

					if (redelegateReward.attributes.length > 2) {
						// eslint-disable-next-line no-shadow
						const redelegateAmount =
							redelegateReward.attributes[2].value.match(/\d+/g)[0];
						// eslint-disable-next-line no-shadow
						const redelegateVal = redelegateReward.attributes[3].value;
						// eslint-disable-next-line no-shadow
						const srcReward = account.account_claimed_rewards.find(
							(x: any) => x.validator_address === redelegateVal,
						);
						if (srcReward) {
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === redelegateVal,
							)!.amount = (
								parseInt(srcReward.amount.toString(), 10) +
								parseInt(redelegateAmount, 10)
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
				const undelegateReward = logs[index].events.find(
					(x: any) => x.type === CONST_CHAR.WITHDRAW_REWARDS,
				);
				if (undelegateReward) {
					try {
						undelegateAmount = undelegateReward.attributes
							.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						undelegateAmount = '0';
					}
				}
				const undeleReward = account.account_claimed_rewards.find(
					(x: any) => x.validator_address === undelegateValAddress,
				);
				if (undeleReward) {
					account.account_claimed_rewards.find(
						(x: any) => x.validator_address === undelegateValAddress,
					)!.amount = (
						parseInt(undeleReward.amount.toString(), 10) +
						parseInt(undelegateAmount, 10)
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
				const claimedRewardWithdraw = log.events.find(
					(event: any) => event.type === CONST_CHAR.WITHDRAW_REWARDS,
				);
				if (claimedRewardWithdraw) {
					try {
						amountWithdraw = claimedRewardWithdraw.attributes
							.find((x: any) => x.key === CONST_CHAR.AMOUNT)
							.value.match(/\d+/g)[0];
					} catch (error) {
						amountWithdraw = '0';
					}
				}
				const rewardWithdraw = account.account_claimed_rewards.find(
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

	public async _start() {
		this.getQueue('crawl.account-claimed-rewards').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.account-claimed-rewards').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.account-claimed-rewards').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
