import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountInfoEntity, ITransaction, Rewards } from '../../entities';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { QueueConfig } from '../../config/queue';
import { Utils } from '../../utils/utils';
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
		for (let tx of listTx) {
			if (tx.tx_response.code !== 0) continue;

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

			try {
				switch (tx.tx.body.messages[0]['@type']) {
					case MSG_TYPE.MSG_DELEGATE:
						const validatorAddress = tx.tx.body.messages[0].validator_address;
						const indexReward = tx.tx_response.logs[0].events
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED)
							.attributes.findIndex((x: any) => x.value === userAddress);
						const claimedReward = tx.tx_response.logs[0].events.find(
							(x: any) => x.type === CONST_CHAR.COIN_RECEIVED,
						).attributes[indexReward + 1].value;
						let amount = '0';
						try {
							let amount = claimedReward.match(/\d+/g)[0];
							if (amount === '' || indexReward < 0) amount = '0';
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
						const valSrcAddress = tx.tx.body.messages[0].validator_src_address;
						const valDstAddress = tx.tx.body.messages[0].validator_dst_address;
						const coinReceived = tx.tx_response.logs[0].events.find(
							(x: any) => x.type === CONST_CHAR.COIN_RECEIVED,
						).attributes;

						const paramValidator = Config.GET_VALIDATOR + valSrcAddress;
						const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
						let resultCallApi = await this.callApiFromDomain(url, paramValidator);
						const redelegateClaimedReward = coinReceived.find(
							(x: any) => x.key === CONST_CHAR.AMOUNT,
						).value;
						if (Number(resultCallApi.validator.commission.commission_rates.rate) !== 1) {
							let srcAmount = '0';
							try {
								srcAmount = redelegateClaimedReward.match(/\d+/g)[0];
								if (srcAmount === '') srcAmount = '0';
							} catch (error) {
								srcAmount = '0';
							}
							let srcReward = account.account_claimed_rewards.find(
								(x: any) => x.validator_address === valSrcAddress,
							);
							if (srcReward) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valSrcAddress,
								)!.amount = (
									parseInt(srcReward.amount.toString(), 10) + parseInt(srcAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valSrcAddress,
									denom: Config.NETWORK_DENOM,
									amount: srcAmount,
								} as Rewards);
							}
						} else {
							let dstAmount = '0';
							try {
								dstAmount = redelegateClaimedReward.match(/\d+/g)[0];
								if (dstAmount === '') dstAmount = '0';
							} catch (error) {
								dstAmount = '0';
							}
							let dstReward = account.account_claimed_rewards.find(
								(x: any) => x.validator_address === valDstAddress,
							);
							if (dstReward) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valDstAddress,
								)!.amount = (
									parseInt(dstReward.amount.toString(), 10) + parseInt(dstAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valDstAddress,
									denom: Config.NETWORK_DENOM,
									amount: dstAmount,
								} as Rewards);
							}
						}
						if (coinReceived.length > 2) {
							const dstClaimedReward = coinReceived[3].value;
							let dstAmount = '0';
							try {
								dstAmount = dstClaimedReward.match(/\d+/g)[0];
								if (dstAmount === '') dstAmount = '0';
							} catch (error) {
								dstAmount = '0';
							}
							let dstReward = account.account_claimed_rewards.find(
								(x: any) => x.validator_address === valDstAddress,
							);
							if (dstReward) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === valDstAddress,
								)!.amount = (
									parseInt(dstReward.amount.toString(), 10) + parseInt(dstAmount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: valDstAddress,
									denom: Config.NETWORK_DENOM,
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
						let undelegateAmount = '0';
						try {
							undelegateAmount = undelegateClaimedReward.match(/\d+/g)[0];
							if (undelegateAmount === '' || undelegateIndexReward < 0) undelegateAmount = '0';
						} catch (error) {
							undelegateAmount = '0';
						}
						let undelegateReward = account.account_claimed_rewards.find(
							(x: any) => x.validator_address === undelegateValAddress,
						);
						if (undelegateReward) {
							account.account_claimed_rewards.find(
								(x: any) => x.validator_address === undelegateValAddress,
							)!.amount = (
								parseInt(undelegateReward.amount.toString(), 10) + parseInt(undelegateAmount, 10)
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
							let amount = '0';
							try {
								amount = claimedReward.match(/\d+/g)[0];
								if (amount === '') amount = '0';
							} catch (error) {
								amount = '0';
							}
							let reward = account.account_claimed_rewards.find(
								(x: any) => x.validator_address === msg.validator_address,
							);
							if (reward) {
								account.account_claimed_rewards.find(
									(x: any) => x.validator_address === msg.validator_address,
								)!.amount = (
									parseInt(reward.amount.toString(), 10) + parseInt(amount, 10)
								).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: msg.validator_address,
									denom: Config.NETWORK_DENOM,
									amount,
								} as Rewards);
							}
						});
						break;
				}
				listAccounts.push(account);
			} catch (error) {
				this.logger.error(error);
			}
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
