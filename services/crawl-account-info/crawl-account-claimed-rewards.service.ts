import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Config } from '../../common';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
import { JsonConvert } from 'json2typescript';
import { Context, Service, ServiceBroker } from 'moleculer';
import { AccountInfoEntity, ITransaction, UnbondingResponse } from '../../entities';
import { Utils } from '../../utils/utils';
import { CrawlAccountInfoParams, ListTxCreatedParams } from '../../types';
const QueueService = require('moleculer-bull');

export default class CrawlAccountClaimedRewardsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbAccountInfoMixin = dbAccountInfoMixin;

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
				this.dbAccountInfoMixin,
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

	async handleJob(listTx: ITransaction[], chainId: string) {
		let listAccounts: AccountInfoEntity[] = [],
			listUpdateQueries: any[] = [];
		const chain = LIST_NETWORK.find(x => x.chainId === chainId);
		try {
			listTx.map((tx: any) => {
				this.logger.info(tx);
				const userAddress = tx.tx.body.messages[0].delegator_address;
				let account = this.adapter.findOne({
					address: userAddress,
					'custom_info.chain_id': chainId,
				});
				if (!account) {
					account = {} as AccountInfoEntity;
					account.address = userAddress;
				}
				switch (tx.tx.body.messages[0]['@type']) {
					case MSG_TYPE.MSG_DELEGATE:
						const validatorAddress = tx.tx.body.messages[0].validator_address;
						const indexReward = tx.logs[0].events[0]
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED).attributes
							.findIndex((x: any) => x.value === userAddress);
						const claimedReward = tx.logs[0].events[0]
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED).attributes[indexReward + 1].value;
						const amount = claimedReward.match(/\d+/g)[0];
						if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === validatorAddress)) {
							account.account_claimed_rewards.find((x: any) => x.validator_address === validatorAddress).amount
								= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === validatorAddress).amount.toString(), 10)
									+ parseInt(amount, 10)).toString();
						} else {
							account.account_claimed_rewards.push({
								validator_address: validatorAddress,
								denom: claimedReward.match(/[a-zA-Z]+/g)[0],
								amount,
							});
						}
						listAccounts.push(account);
						break;
					case MSG_TYPE.MSG_REDELEGATE:
						const valSrcAddress = tx.tx.body.messages[0].validator_src_address;
						const valDstAddress = tx.tx.body.messages[0].validator_dst_address;
						const coinReceived = tx.logs[0].events[0].find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED).attributes;
						if (coinReceived.length === 2) {
							const srcClaimedReward = coinReceived.find((x: any) => x.key === CONST_CHAR.AMOUNT).value;
							const srcAmount = srcClaimedReward.match(/\d+/g)[0];
							if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress)) {
								account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress).amount
									= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress).amount.toString(), 10)
										+ parseInt(srcAmount, 10)).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: validatorAddress,
									denom: srcClaimedReward.match(/[a-zA-Z]+/g)[0],
									amount: srcAmount,
								});
							}
						} else if (coinReceived.length > 2) {
							const srcClaimedReward = coinReceived[1].value;
							const dstClaimedReward = coinReceived[3].value;
							const srcAmount = srcClaimedReward.match(/\d+/g)[0];
							const dstAmount = dstClaimedReward.match(/\d+/g)[0];
							if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress)) {
								account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress).amount
									= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === valSrcAddress).amount.toString(), 10)
										+ parseInt(srcAmount, 10)).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: validatorAddress,
									denom: srcClaimedReward.match(/[a-zA-Z]+/g)[0],
									amount: srcAmount,
								});
							}
							if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === valDstAddress)) {
								account.account_claimed_rewards.find((x: any) => x.validator_address === valDstAddress).amount
									= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === valDstAddress).amount.toString(), 10)
										+ parseInt(dstAmount, 10)).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: validatorAddress,
									denom: dstClaimedReward.match(/[a-zA-Z]+/g)[0],
									amount: dstAmount,
								});
							}
						}
						listAccounts.push(account);
						break;
					case MSG_TYPE.MSG_UNDELEGATE:
						const undelegateValAddress = tx.tx.body.messages[0].validator_address;
						const undelegateIndexReward = tx.logs[0].events[0]
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED).attributes
							.findIndex((x: any) => x.value === userAddress);
						const undelegateClaimedReward = tx.logs[0].events[0]
							.find((x: any) => x.type === CONST_CHAR.COIN_RECEIVED).attributes[undelegateIndexReward + 1].value;
						const undelegateAmount = undelegateClaimedReward.match(/\d+/g)[0];
						if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === undelegateValAddress)) {
							account.account_claimed_rewards.find((x: any) => x.validator_address === undelegateValAddress).amount
								= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === undelegateValAddress).amount.toString(), 10)
									+ parseInt(undelegateAmount, 10)).toString();
						} else {
							account.account_claimed_rewards.push({
								validator_address: validatorAddress,
								denom: undelegateClaimedReward.match(/[a-zA-Z]+/g)[0],
								amount: undelegateAmount,
							});
						}
						listAccounts.push(account);
						break;
					case MSG_TYPE.MSG_WITHDRAW_REWARDS:
						tx.tx.body.messages.map((msg: any) => {
							const log = tx.logs.find((log: any) => {
								log.events.find((event: any) => event.type === CONST_CHAR.WITHDRAW_REWARDS).attributes
									.find((attr: any) => attr.value === msg.validator_address);
							});
							const claimedReward = log.events.find((event: any) => event.type === CONST_CHAR.WITHDRAW_REWARDS)
								.attributes.find((attr: any) => attr.key === CONST_CHAR.AMOUNT).value;
							const amount = claimedReward.match(/\d+/g)[0];
							if (account.account_claimed_rewards && account.account_claimed_rewards.find((x: any) => x.validator_address === msg.validator_address)) {
								account.account_claimed_rewards.find((x: any) => x.validator_address === msg.validator_address).amount
									= (parseInt(account.account_claimed_rewards.find((x: any) => x.validator_address === msg.validator_address).amount.toString(), 10)
										+ parseInt(amount, 10)).toString();
							} else {
								account.account_claimed_rewards.push({
									validator_address: msg.validator_address,
									denom: claimedReward.match(/[a-zA-Z]+/g)[0],
									amount,
								});
							}
						});
						listAccounts.push(account);
						break;
				}
			});

			listAccounts.map((element) => {
				if (element._id) listUpdateQueries.push(this.adapter.updateById(element._id, { $set: { account_claimed_rewards: element.account_claimed_rewards } }));
				else {
					const item: AccountInfoEntity = new JsonConvert().deserializeObject(element, AccountInfoEntity);
					item.custom_info = {
						chain_id: chainId,
						chain_name: chain ? chain.chainName : '',
					};
					listUpdateQueries.push(this.adapter.insert(item));
				}
			});
		} catch (error) {
			this.logger.error(error);
		}
	}

	async _start() {
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
