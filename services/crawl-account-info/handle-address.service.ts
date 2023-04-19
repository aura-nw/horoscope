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
					try {
						element.tx_response.logs.map((log: any) => {
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
						});
					} catch (error) {
						this.logger.error(error);
					}
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
						_id: null,
						tx: {
							body: {
								messages: [
									{
										'@type': '/cosmos.staking.v1beta1.MsgDelegate',
										delegator_address:
											'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
										validator_address:
											'auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z',
										amount: { denom: 'uaura', amount: '100000' },
									},
								],
								memo: '',
								timeout_height: { low: 0, high: 0, unsigned: true },
								extension_options: [],
								non_critical_extension_options: [],
							},
							auth_info: {
								fee: {
									amount: [{ denom: 'uaura', amount: '200' }],
									gas_limit: { low: 200000, high: 0, unsigned: true },
									granter: '',
									payer: '',
								},
								signer_infos: [
									{
										mode_info: { single: { mode: 1 } },
										public_key: {
											'@type': '/cosmos.crypto.secp256k1.PubKey',
											key: 'A6kj12RZLoswpVSIMo76XoKPjZGCkc8HrOwNHmD5P0Sg',
										},
										sequence: '213238',
									},
								],
							},
							signatures: [
								'snLZldILc5z5FbkIT/zQP+kSUkGPXv5nLtnJ+mjr8VBrpX6WCbeFNjQPFqEHDjPVVzHxW2uHQuMFNQTx1lylJg==',
							],
						},
						tx_response: {
							height: '13237802',
							txhash: '3D94FEB24EF5A2EB660D705E10DE400CF9557E30E4713EC6ADDC77DA537C7C4A',
							codespace: '',
							code: 0,
							data: 'CiUKIy9jb3Ntb3Muc3Rha2luZy52MWJldGExLk1zZ0RlbGVnYXRl',
							raw_log:
								'[{"events":[{"type":"coin_received","attributes":[{"key":"receiver","value":"aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6"},{"key":"amount","value":"100000uaura"}]},{"type":"coin_spent","attributes":[{"key":"spender","value":"aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t"},{"key":"amount","value":"100000uaura"}]},{"type":"delegate","attributes":[{"key":"validator","value":"auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z"},{"key":"amount","value":"100000uaura"},{"key":"new_shares","value":"100913.242009132420091320"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmos.staking.v1beta1.MsgDelegate"},{"key":"module","value":"staking"},{"key":"sender","value":"aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t"}]},{"type":"withdraw_rewards","attributes":[{"key":"amount","value":"0uaura"},{"key":"validator","value":"auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z"}]}]}]',
							info: '',
							gas_wanted: '200000',
							gas_used: '144359',
							tx: {
								body: {
									messages: [
										{
											'@type': '/cosmos.staking.v1beta1.MsgDelegate',
											delegator_address:
												'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
											validator_address:
												'auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z',
											amount: { denom: 'uaura', amount: '100000' },
										},
									],
									memo: '',
									timeout_height: { low: 0, high: 0, unsigned: true },
									extension_options: [],
									non_critical_extension_options: [],
								},
								auth_info: {
									fee: {
										amount: [{ denom: 'uaura', amount: '200' }],
										gas_limit: { low: 200000, high: 0, unsigned: true },
										granter: '',
										payer: '',
									},
									signer_infos: [
										{
											mode_info: { single: { mode: 1 } },
											public_key: {
												'@type': '/cosmos.crypto.secp256k1.PubKey',
												key: 'A6kj12RZLoswpVSIMo76XoKPjZGCkc8HrOwNHmD5P0Sg',
											},
											sequence: '213238',
										},
									],
								},
								signatures: [
									'snLZldILc5z5FbkIT/zQP+kSUkGPXv5nLtnJ+mjr8VBrpX6WCbeFNjQPFqEHDjPVVzHxW2uHQuMFNQTx1lylJg==',
								],
							},
							events: [
								{
									type: 'coin_spent',
									attributes: [
										{
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MjAwdWF1cmE=', index: true },
									],
								},
								{
									type: 'coin_received',
									attributes: [
										{
											key: 'cmVjZWl2ZXI=',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MjAwdWF1cmE=', index: true },
									],
								},
								{
									type: 'transfer',
									attributes: [
										{
											key: 'cmVjaXBpZW50',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MjAwdWF1cmE=', index: true },
									],
								},
								{
									type: 'message',
									attributes: [
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{ key: 'ZmVl', value: 'MjAwdWF1cmE=', index: true },
										{
											key: 'ZmVlX3BheWVy',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'YWNjX3NlcQ==',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dC8yMTMyMzg=',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'c25MWmxkSUxjNXo1RmJrSVQvelFQK2tTVWtHUFh2NW5MdG5KK21qcjhWQnJwWDZXQ2JlRk5qUVBGcUVIRGpQVlZ6SHhXMnVIUXVNRk5RVHgxbHlsSmc9PQ==',
											index: true,
										},
									],
								},
								{
									type: 'message',
									attributes: [
										{
											key: 'YWN0aW9u',
											value: 'L2Nvc21vcy5zdGFraW5nLnYxYmV0YTEuTXNnRGVsZWdhdGU=',
											index: true,
										},
									],
								},
								{
									type: 'withdraw_rewards',
									attributes: [
										{ key: 'YW1vdW50', value: 'MHVhdXJh', index: true },
										{
											key: 'dmFsaWRhdG9y',
											value: 'YXVyYXZhbG9wZXIxazhmeWgwNXpmZnNhMmVqd3VzZDBubGZ0c3J4MHUwNHdna2c1M3o=',
											index: true,
										},
									],
								},
								{
									type: 'coin_spent',
									attributes: [
										{
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MTAwMDAwdWF1cmE=', index: true },
									],
								},
								{
									type: 'coin_received',
									attributes: [
										{
											key: 'cmVjZWl2ZXI=',
											value: 'YXVyYTF0eWdtczN4aGhzM3l2NDg3cGh4M2R3NGE5NWpuN3Q3bDZkenVkNg==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MTAwMDAwdWF1cmE=', index: true },
									],
								},
								{
									type: 'delegate',
									attributes: [
										{
											key: 'dmFsaWRhdG9y',
											value: 'YXVyYXZhbG9wZXIxazhmeWgwNXpmZnNhMmVqd3VzZDBubGZ0c3J4MHUwNHdna2c1M3o=',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'MTAwMDAwdWF1cmE=', index: true },
										{
											key: 'bmV3X3NoYXJlcw==',
											value: 'MTAwOTEzLjI0MjAwOTEzMjQyMDA5MTMyMA==',
											index: true,
										},
									],
								},
								{
									type: 'message',
									attributes: [
										{ key: 'bW9kdWxl', value: 'c3Rha2luZw==', index: true },
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTFneXB0Mnc3eGc1dDl5cjc2aHg2emVtd2Q0eHY3Mmpja2swM3I2dA==',
											index: true,
										},
									],
								},
							],
							timestamp: '2023-04-19T09:49:18.166Z',
							logs: [
								{
									events: [
										{
											type: 'coin_received',
											attributes: [
												{
													key: 'receiver',
													value: 'aura1tygms3xhhs3yv487phx3dw4a95jn7t7l6dzud6',
												},
												{ key: 'amount', value: '100000uaura' },
											],
										},
										{
											type: 'coin_spent',
											attributes: [
												{
													key: 'spender',
													value: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
												},
												{ key: 'amount', value: '100000uaura' },
											],
										},
										{
											type: 'delegate',
											attributes: [
												{
													key: 'validator',
													value: 'auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z',
												},
												{ key: 'amount', value: '100000uaura' },
												{
													key: 'new_shares',
													value: '100913.242009132420091320',
												},
											],
										},
										{
											type: 'message',
											attributes: [
												{
													key: 'action',
													value: '/cosmos.staking.v1beta1.MsgDelegate',
												},
												{ key: 'module', value: 'staking' },
												{
													key: 'sender',
													value: 'aura1gypt2w7xg5t9yr76hx6zemwd4xv72jckk03r6t',
												},
											],
										},
										{
											type: 'withdraw_rewards',
											attributes: [
												{ key: 'amount', value: '0uaura' },
												{
													key: 'validator',
													value: 'auravaloper1k8fyh05zffsa2ejwusd0nlftsrx0u04wgkg53z',
												},
											],
										},
									],
								},
							],
						},
						custom_info: {},
						indexes: {},
					},
					{
						_id: null,
						tx: {
							body: {
								messages: [
									{
										'@type': '/cosmwasm.wasm.v1.MsgExecuteContract',
										sender: 'aura1lmh9hcprnyp0shrppk3szuh8r8pludc83z3y49',
										contract:
											'aura1fvy3rzv5fhe6xf2z2d0j2p0xcf0c75ry2ktwxreg6wa3zlup0p7qqwzj3a',
										msg: { mint: { amount: '1', phase_id: '1' } },
										funds: [],
									},
								],
								memo: '',
								timeout_height: { low: 0, high: 0, unsigned: true },
								extension_options: [],
								non_critical_extension_options: [],
							},
							auth_info: {
								fee: {
									amount: [{ denom: 'uaura', amount: '625' }],
									gas_limit: { low: 250000, high: 0, unsigned: true },
									granter: '',
									payer: '',
								},
								signer_infos: [
									{
										mode_info: {
											multi: {
												bitarray: {
													extraBitsStored: 2,
													elems: { '0': 192 },
												},
												modeInfos: [
													{ single: { mode: 127 } },
													{ single: { mode: 127 } },
												],
											},
										},
										public_key: {
											'@type': '/cosmos.crypto.multisig.LegacyAminoPubKey',
											key: 'EkYKHy9jb3Ntb3MuY3J5cHRvLnNlY3AyNTZrMS5QdWJLZXkSIwohA7ev5RYnXU0vxxXTiGKzolaoup3W3tDOCpvOBDSzpRUiEkYKHy9jb3Ntb3MuY3J5cHRvLnNlY3AyNTZrMS5QdWJLZXkSIwohAxGbrjvk+U1IjKeXYeO4Vp42pSYSM8JQFkabbjhVtiec',
										},
										sequence: '3',
									},
								],
							},
							signatures: [
								'CkAEHyApDOhnXdc4k4SFRnxkaLMIl+kQ14ZUqEZgZmsynWaCMrQwkvMQGIUSau78vAxjzbMq2WdxCgK2XUdFjXFLCkDT/yzLhQvkY8zEccJASvR2bUiHbbHnJciJgDG3hZLyAmY0pxjaTb2A5wpfz0Pv+3ouP6IUb5FJEHpylwMxyhk0',
							],
						},
						tx_response: {
							height: '13237802',
							txhash: '571605291BF07E71A42B9762E2164E5040C7093837F202381321F5E675A6F5D7',
							codespace: 'wasm',
							code: 5,
							data: null,
							raw_log:
								'failed to execute message; message index: 0: Error parsing into type nft_launchpad::msg::ExecuteMsg: Invalid type: execute wasm contract failed',
							info: '',
							gas_wanted: '250000',
							gas_used: '130185',
							tx: {
								body: {
									messages: [
										{
											'@type': '/cosmwasm.wasm.v1.MsgExecuteContract',
											sender: 'aura1lmh9hcprnyp0shrppk3szuh8r8pludc83z3y49',
											contract:
												'aura1fvy3rzv5fhe6xf2z2d0j2p0xcf0c75ry2ktwxreg6wa3zlup0p7qqwzj3a',
											msg: { mint: { amount: '1', phase_id: '1' } },
											funds: [],
										},
									],
									memo: '',
									timeout_height: { low: 0, high: 0, unsigned: true },
									extension_options: [],
									non_critical_extension_options: [],
								},
								auth_info: {
									fee: {
										amount: [{ denom: 'uaura', amount: '625' }],
										gas_limit: { low: 250000, high: 0, unsigned: true },
										granter: '',
										payer: '',
									},
									signer_infos: [
										{
											mode_info: {
												multi: {
													bitarray: {
														extraBitsStored: 2,
														elems: { '0': 192 },
													},
													modeInfos: [
														{ single: { mode: 127 } },
														{ single: { mode: 127 } },
													],
												},
											},
											public_key: {
												'@type':
													'/cosmos.crypto.multisig.LegacyAminoPubKey',
												key: 'EkYKHy9jb3Ntb3MuY3J5cHRvLnNlY3AyNTZrMS5QdWJLZXkSIwohA7ev5RYnXU0vxxXTiGKzolaoup3W3tDOCpvOBDSzpRUiEkYKHy9jb3Ntb3MuY3J5cHRvLnNlY3AyNTZrMS5QdWJLZXkSIwohAxGbrjvk+U1IjKeXYeO4Vp42pSYSM8JQFkabbjhVtiec',
											},
											sequence: '3',
										},
									],
								},
								signatures: [
									'CkAEHyApDOhnXdc4k4SFRnxkaLMIl+kQ14ZUqEZgZmsynWaCMrQwkvMQGIUSau78vAxjzbMq2WdxCgK2XUdFjXFLCkDT/yzLhQvkY8zEccJASvR2bUiHbbHnJciJgDG3hZLyAmY0pxjaTb2A5wpfz0Pv+3ouP6IUb5FJEHpylwMxyhk0',
								],
							},
							events: [
								{
									type: 'coin_spent',
									attributes: [
										{
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTFsbWg5aGNwcm55cDBzaHJwcGszc3p1aDhyOHBsdWRjODN6M3k0OQ==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'NjI1dWF1cmE=', index: true },
									],
								},
								{
									type: 'coin_received',
									attributes: [
										{
											key: 'cmVjZWl2ZXI=',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'NjI1dWF1cmE=', index: true },
									],
								},
								{
									type: 'transfer',
									attributes: [
										{
											key: 'cmVjaXBpZW50',
											value: 'YXVyYTE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHQwNXpmeQ==',
											index: true,
										},
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTFsbWg5aGNwcm55cDBzaHJwcGszc3p1aDhyOHBsdWRjODN6M3k0OQ==',
											index: true,
										},
										{ key: 'YW1vdW50', value: 'NjI1dWF1cmE=', index: true },
									],
								},
								{
									type: 'message',
									attributes: [
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTFsbWg5aGNwcm55cDBzaHJwcGszc3p1aDhyOHBsdWRjODN6M3k0OQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{ key: 'ZmVl', value: 'NjI1dWF1cmE=', index: true },
										{
											key: 'ZmVlX3BheWVy',
											value: 'YXVyYTFsbWg5aGNwcm55cDBzaHJwcGszc3p1aDhyOHBsdWRjODN6M3k0OQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'YWNjX3NlcQ==',
											value: 'YXVyYTFsbWg5aGNwcm55cDBzaHJwcGszc3p1aDhyOHBsdWRjODN6M3k0OS8z',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'QkI4Z0tRem9aMTNYT0pPRWhVWjhaR2l6Q0pmcEVOZUdWS2hHWUdack1wMW1nakswTUpMekVCaUZFbXJ1L0x3TVk4MnpLdGxuY1FvQ3RsMUhSWTF4U3c9PQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'MC84c3k0VUw1R1BNeEhIQ1FFcjBkbTFJaDIyeDV5WElpWUF4dDRXUzhnSm1OS2NZMmsyOWdPY0tYODlENy90NkxqK2lGRytSU1JCNmNwY0RNY29aTkE9PQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'Q2tBRUh5QXBET2huWGRjNGs0U0ZSbnhrYUxNSWwra1ExNFpVcUVaZ1ptc3luV2FDTXJRd2t2TVFHSVVTYXU3OHZBeGp6Yk1xMldkeENnSzJYVWRGalhGTENrRFQveXpMaFF2a1k4ekVjY0pBU3ZSMmJVaUhiYkhuSmNpSmdERzNoWkx5QW1ZMHB4amFUYjJBNXdwZnowUHYrM291UDZJVWI1RkpFSHB5bHdNeHloazA=',
											index: true,
										},
									],
								},
							],
							timestamp: '2023-04-19T09:49:18.166Z',
						},
						custom_info: {},
						indexes: {},
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
