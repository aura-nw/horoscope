/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle, camelcase */
/* eslint-disable prettier/prettier */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { JsonConvert } from 'json2typescript';
import { Utils } from '../../utils/utils';
import { CONST_CHAR, LIST_NETWORK, MSG_TYPE } from '../../common/constant';
import { AccountInfoEntity } from '../../entities';
import { dbAccountInfoMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { queueConfig } from '../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleAddressService extends Service {
	public constructor(broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handleAddress',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts), dbAccountInfoMixin],
			queues: {
				'handle.address': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_ADDRESS, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listTx, job.data.source, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			actions: {
				accountinfoupsert: {
					name: 'accountinfoupsert',
					rest: 'GET /account-info/:address',
					handler: (ctx: any) => {
						this.logger.debug('Crawl account info');
						this.handleJob(ctx.params.listTx, ctx.params.source, ctx.params.chainId);
					},
				},
			},
		});
	}

	public async handleJob(listTx: any[], source: string, chainId: string) {
		const listAddresses: any[] = [];
		let listUpdateInfo = [
			'crawl.account-auth-info',
			'crawl.account-balances',
			'crawl.account-spendable-balances',
		];
		const listInsert: any[] = [];
		const chain = LIST_NETWORK.find((x) => x.chainId === chainId);
		if (listTx.length > 0) {
			this.logger.info(`Handle Txs: ${JSON.stringify(listTx)}`);

			for (const element of listTx) {
				if (source === CONST_CHAR.CRAWL) {
					element.tx_response.logs.map((log: any) => {
						try {
							let event = log.events
								.filter(
									(e: any) =>
										e.type === CONST_CHAR.COIN_RECEIVED ||
										e.type === CONST_CHAR.COIN_SPENT ||
										e.type === CONST_CHAR.MESSAGE,
								)
								.map((e: any) => e.attributes)
								.map((e: any) =>
									e
										.filter(
											(x: any) =>
												x.key === CONST_CHAR.RECEIVER ||
												x.key === CONST_CHAR.SPENDER ||
												x.key === CONST_CHAR.SENDER,
										)
										.map((x: any) => x.value),
								)
								.flat();
							event = event.filter((e: string) =>
								Utils.isValidAccountAddress(e, Config.NETWORK_PREFIX_ADDRESS, 20),
							);
							if (event) {
								listAddresses.push(...event);
							}
						} catch (error) {
							this.logger.error(error);
							throw error;
						}
					});
					try {
						let blockEvent = element.tx_response.events
							.filter(
								(e: any) =>
									e.type === CONST_CHAR.COIN_RECEIVED ||
									e.type === CONST_CHAR.COIN_SPENT ||
									e.type === CONST_CHAR.MESSAGE,
							)
							.map((e: any) => e.attributes)
							.map((e: any) =>
								e
									.filter(
										(x: any) =>
											x.key === btoa(CONST_CHAR.RECEIVER) ||
											x.key === btoa(CONST_CHAR.SPENDER) ||
											x.key === btoa(CONST_CHAR.SENDER),
									)
									.map((x: any) => atob(x.value)),
							)
							.flat();
						blockEvent = blockEvent.filter((e: string) =>
							Utils.isValidAccountAddress(e, Config.NETWORK_PREFIX_ADDRESS, 20),
						);
						if (blockEvent) {
							listAddresses.push(...blockEvent);
						}
					} catch (error) {
						this.logger.error(error);
						throw error;
					}

					element.tx.body.messages.map((msg: any) => {
						switch (msg['@type']) {
							case MSG_TYPE.MSG_DELEGATE:
								listUpdateInfo.push('crawl.account-delegates');
								break;
							case MSG_TYPE.MSG_REDELEGATE:
								listUpdateInfo.push(
									...['crawl.account-delegates', 'crawl.account-redelegates'],
								);
								break;
							case MSG_TYPE.MSG_UNDELEGATE:
								listUpdateInfo.push(
									...['crawl.account-delegates', 'crawl.account-unbonds'],
								);
								break;
							default:
								listUpdateInfo.push(
									...[
										'crawl.account-delegates',
										'crawl.account-redelegates',
										'crawl.account-unbonds',
									],
								);
								break;
						}
					});
				} else if (source === CONST_CHAR.API) {
					listAddresses.push(element.address);
					listUpdateInfo.push(
						...[
							'crawl.account-delegates',
							'crawl.account-redelegates',
							'crawl.account-unbonds',
						],
					);
				}
			}

			// Filter any invalid and duplicate addresses
			const listUniqueAddresses = listAddresses
				.filter(this._onlyUnique)
				.filter((addr: string) =>
					Utils.isValidAccountAddress(addr, Config.NETWORK_PREFIX_ADDRESS, 20),
				);
			// Filter list jobs to remove duplicates (if any)
			listUpdateInfo = listUpdateInfo.filter(this._onlyUnique);
			if (chain && chain.databaseName) {
				this.adapter.useDb(chain.databaseName);
			}
			const existedAccounts: AccountInfoEntity[] = (
				await this.adapter.find({
					query: {
						address: {
							$in: listUniqueAddresses,
						},
					},
				})
			).map((account: AccountInfoEntity) => account.address);

			if (listUniqueAddresses.length > 0) {
				try {
					listUniqueAddresses.map((address) => {
						if (!existedAccounts.includes(address)) {
							const account: AccountInfoEntity = {} as AccountInfoEntity;
							account.address = address;
							const item: AccountInfoEntity = new JsonConvert().deserializeObject(
								account,
								AccountInfoEntity,
							);
							item.custom_info = {
								chain_id: chainId,
								chain_name: chain ? chain.chainName : '',
							};
							listInsert.push({ insertOne: { document: item } });
						}
					});
					if (chain && chain.databaseName) {
						this.adapter.useDb(chain.databaseName);
					}
					const result = await this.adapter.bulkWrite(listInsert);
					this.logger.info(`${JSON.stringify(result)}`);
				} catch (error) {
					this.logger.error(error);
				}
				listUpdateInfo.map((item) => {
					this.createJob(
						item,
						{ listAddresses: listUniqueAddresses, chainId },
						{
							removeOnComplete: true,
							removeOnFail: {
								count: 10,
							},
						},
					);
				});
			}
			if (source !== CONST_CHAR.API) {
				this.createJob(
					'crawl.account-claimed-rewards',
					{ listTx },
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

	private _onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
	}

	public async _start() {
		this.createJob(
			'handle.address',
			{
				listTx: [
					{
						tx: {
							body: {
								messages: [
									{
										'@type': '/cosmos.bank.v1beta1.MsgSend',
										from_address: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
										to_address: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
										amount: [
											{
												denom: 'utaura',
												amount: '1000000',
											},
										],
									},
								],
								extension_options: [],
								non_critical_extension_options: [],
							},
							auth_info: {
								fee: {
									amount: [
										{
											_id: {
												$oid: '64102c7ca3f3933b23bb8110',
											},
											denom: 'utaura',
											amount: '2171',
										},
									],
									gas_limit: '86810',
									granter: '',
									payer: '',
								},
								signer_infos: [
									{
										mode_info: {
											single: {
												mode: '127',
											},
										},
										_id: {
											$oid: '64102c7ca3f393cf0abb8111',
										},
										public_key: {
											'@type': '/cosmos.crypto.secp256k1.PubKey',
											key: 'AwGiaDuo6ICUpXpZy7Ii/P4QnZWrC2+fvBvF6f+3r4f8',
										},
										sequence: '316',
									},
								],
							},
							signatures: [
								'U1as3s644+dfNDOa+oTBTxykIfWnGkGP4FsoeRB6mqdS18khb0DEimeF3TUIZ8BunPKlogZPW0Rv41xjHDZgtg==',
							],
						},
						custom_info: {
							chain_id: 'aura-testnet-2',
							chain_name: 'Aura devnet',
						},
						tx_response: {
							height: 5272005,
							txhash: '70F74804A0E0DE9C30628E3F764936F5F717AE3F8CE5E89EA51F8415EFB16A58',
							codespace: '',
							code: '0',
							data: 'Ch4KHC9jb3Ntb3MuYmFuay52MWJldGExLk1zZ1NlbmQ=',
							raw_log:
								'[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"},{"key":"amount","value":"1000000utaura"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"},{"key":"amount","value":"1000000utaura"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.bank.v1beta1.MsgSend"},{"key":"sender","value":"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"},{"key":"module","value":"bank"}]},{"type":"transfer","attributes":[{"key":"recipient","value":"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"},{"key":"sender","value":"aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5"},{"key":"amount","value":"1000000utaura"}]}]}]',
							info: '',
							gas_wanted: '86810',
							gas_used: '70966',
							tx: {
								body: {
									messages: [
										{
											'@type': '/cosmos.bank.v1beta1.MsgSend',
											from_address:
												'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
											to_address:
												'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
											amount: [
												{
													denom: 'utaura',
													amount: '1000000',
												},
											],
										},
									],
								},
								auth_info: {
									fee: {
										amount: [
											{
												denom: 'utaura',
												amount: '2171',
											},
										],
										gas_limit: {
											low: 86810,
											high: 0,
											unsigned: true,
										},
										granter: '',
										payer: '',
									},
									signer_infos: [
										{
											mode_info: {
												single: {
													mode: 127,
												},
											},
											public_key: {
												'@type': '/cosmos.crypto.secp256k1.PubKey',
												key: 'AwGiaDuo6ICUpXpZy7Ii/P4QnZWrC2+fvBvF6f+3r4f8',
											},
											sequence: '316',
										},
									],
								},
								signatures: [
									'U1as3s644+dfNDOa+oTBTxykIfWnGkGP4FsoeRB6mqdS18khb0DEimeF3TUIZ8BunPKlogZPW0Rv41xjHDZgtg==',
								],
							},
							events: [
								{
									_id: {
										$oid: '64102c7ca3f3937cf5bb8112',
									},
									type: 'coin_spent',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f39360c6bb8113',
											},
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f393daa5bb8114',
											},
											key: 'YW1vdW50',
											value: 'MjE3MXV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f393c808bb8115',
									},
									type: 'coin_received',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3930ea1bb8116',
											},
											key: 'cmVjZWl2ZXI=',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f3937ae1bb8117',
											},
											key: 'YW1vdW50',
											value: 'MjE3MXV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3938591bb8118',
									},
									type: 'transfer',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3936804bb8119',
											},
											key: 'cmVjaXBpZW50',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f3932512bb811a',
											},
											key: 'c2VuZGVy',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f39323b0bb811b',
											},
											key: 'YW1vdW50',
											value: 'MjE3MXV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3930bc1bb811c',
									},
									type: 'message',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3933591bb811d',
											},
											key: 'c2VuZGVy',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3934f8fbb811e',
									},
									type: 'tx',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f393a543bb811f',
											},
											key: 'ZmVl',
											value: 'MjE3MXV0YXVyYQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f3937bd1bb8120',
											},
											key: 'ZmVlX3BheWVy',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3937ea4bb8121',
									},
									type: 'tx',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f393036fbb8122',
											},
											key: 'YWNjX3NlcQ==',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNS8zMTY=',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f393858ebb8123',
									},
									type: 'tx',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3934b26bb8124',
											},
											key: 'c2lnbmF0dXJl',
											value: 'VTFhczNzNjQ0K2RmTkRPYStvVEJUeHlrSWZXbkdrR1A0RnNvZVJCNm1xZFMxOGtoYjBERWltZUYzVFVJWjhCdW5QS2xvZ1pQVzBSdjQxeGpIRFpndGc9PQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3931ae5bb8125',
									},
									type: 'message',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f393c233bb8126',
											},
											key: 'YWN0aW9u',
											value: 'L2Nvc21vcy5iYW5rLnYxYmV0YTEuTXNnU2VuZA==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f39300eebb8127',
									},
									type: 'coin_spent',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3934936bb8128',
											},
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f393d50abb8129',
											},
											key: 'YW1vdW50',
											value: 'MTAwMDAwMHV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f393d176bb812a',
									},
									type: 'coin_received',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f393c0d6bb812b',
											},
											key: 'cmVjZWl2ZXI=',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f3936227bb812c',
											},
											key: 'YW1vdW50',
											value: 'MTAwMDAwMHV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f3931117bb812d',
									},
									type: 'transfer',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3930051bb812e',
											},
											key: 'cmVjaXBpZW50',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f3934f16bb812f',
											},
											key: 'c2VuZGVy',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
										{
											_id: {
												$oid: '64102c7ca3f393e38ebb8130',
											},
											key: 'YW1vdW50',
											value: 'MTAwMDAwMHV0YXVyYQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f393229bbb8131',
									},
									type: 'message',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f393215ebb8132',
											},
											key: 'c2VuZGVy',
											value: 'YXVyYTE1ZjZ3bjNueW1kbmhuaDVkZGxxbGV0dXB0amFnMDl0cnlydHBxNQ==',
											index: true,
										},
									],
								},
								{
									_id: {
										$oid: '64102c7ca3f39354cbbb8133',
									},
									type: 'message',
									attributes: [
										{
											_id: {
												$oid: '64102c7ca3f3937ec2bb8134',
											},
											key: 'bW9kdWxl',
											value: 'YmFuaw==',
											index: true,
										},
									],
								},
							],
							timestamp: {
								$date: {
									$numberLong: '1678781559036',
								},
							},
							logs: [
								{
									_id: {
										$oid: '64102c7ca3f3931e91bb8135',
									},
									events: [
										{
											_id: {
												$oid: '64102c7ca3f393dcfcbb8136',
											},
											type: 'coin_received',
											attributes: [
												{
													_id: {
														$oid: '64102c7ca3f393438fbb8137',
													},
													key: 'receiver',
													value: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
												},
												{
													_id: {
														$oid: '64102c7ca3f3936881bb8138',
													},
													key: 'amount',
													value: '1000000utaura',
												},
											],
										},
										{
											_id: {
												$oid: '64102c7ca3f393719fbb8139',
											},
											type: 'coin_spent',
											attributes: [
												{
													_id: {
														$oid: '64102c7ca3f393bc8fbb813a',
													},
													key: 'spender',
													value: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
												},
												{
													_id: {
														$oid: '64102c7ca3f393f40cbb813b',
													},
													key: 'amount',
													value: '1000000utaura',
												},
											],
										},
										{
											_id: {
												$oid: '64102c7ca3f39335c0bb813c',
											},
											type: 'message',
											attributes: [
												{
													_id: {
														$oid: '64102c7ca3f3933c7bbb813d',
													},
													key: 'action',
													value: '/cosmos.bank.v1beta1.MsgSend',
												},
												{
													_id: {
														$oid: '64102c7ca3f393385ebb813e',
													},
													key: 'sender',
													value: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
												},
												{
													_id: {
														$oid: '64102c7ca3f393e4babb813f',
													},
													key: 'module',
													value: 'bank',
												},
											],
										},
										{
											_id: {
												$oid: '64102c7ca3f393ae1cbb8140',
											},
											type: 'transfer',
											attributes: [
												{
													_id: {
														$oid: '64102c7ca3f393a7bdbb8141',
													},
													key: 'recipient',
													value: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
												},
												{
													_id: {
														$oid: '64102c7ca3f3935ed5bb8142',
													},
													key: 'sender',
													value: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
												},
												{
													_id: {
														$oid: '64102c7ca3f39342c8bb8143',
													},
													key: 'amount',
													value: '1000000utaura',
												},
											],
										},
									],
								},
							],
						},
						indexes: {
							timestamp: {
								$date: {
									$numberLong: '1678781559036',
								},
							},
							height: 5272005,
							coin_spent_spender: ['aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'],
							addresses: [
								'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
								'aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy',
							],
							coin_spent_amount: ['2171utaura', '1000000utaura'],
							coin_received_receiver: [
								'aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy',
								'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
							],
							coin_received_amount: ['2171utaura', '1000000utaura'],
							transfer_recipient: [
								'aura17xpfvakm2amg962yls6f84z3kell8c5lt05zfy',
								'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
							],
							transfer_sender: ['aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'],
							transfer_amount: ['2171utaura', '1000000utaura'],
							message_sender: ['aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'],
							tx_fee: ['2171utaura'],
							tx_fee_payer: ['aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'],
							tx_acc_seq: ['aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5/316'],
							tx_signature: [
								'U1as3s644+dfNDOa+oTBTxykIfWnGkGP4FsoeRB6mqdS18khb0DEimeF3TUIZ8BunPKlogZPW0Rv41xjHDZgtg==',
							],
							message_action: ['/cosmos.bank.v1beta1.MsgSend'],
							message_module: ['bank'],
						},
						__v: 0,
					},
				],
				chainId: Config.CHAIN_ID,
				source: 'crawl',
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
				},
				attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
				backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
			},
		);
		this.getQueue('handle.address').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('handle.address').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('handle.address').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
