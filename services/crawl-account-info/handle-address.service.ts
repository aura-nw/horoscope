/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle, camelcase */
/* eslint-disable prettier/prettier */
import { Context, Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { ListTxCreatedParams } from 'types';
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
			// Events: {
			// 	'list-tx.upsert': {
			// 		Handler: (ctx: Context<ListTxCreatedParams>) => {
			// 			This.logger.debug('Handle address');
			// 			This.createJob(
			// 				'handle.address',
			// 				{
			// 					ListTx: ctx.params.listTx,
			// 					Source: ctx.params.source,
			// 					ChainId: ctx.params.chainId,
			// 				},
			// 				{
			// 					RemoveOnComplete: true,
			// 					RemoveOnFail: {
			// 						Count: 10,
			// 					},
			// 				},
			// 			);
			// 			Return;
			// 		},
			// 	},
			// },
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
							// const eventMessage = log.events
							// 	.filter((e: any) => e.type === CONST_CHAR.MESSAGE)
							// 	.map((e: any) => e.attributes)
							// 	.map((e: any) =>
							// 		e
							// 			.filter((x: any) => x.key === CONST_CHAR.SENDER)
							// 			.map((x: any) => x.value),
							// 	)
							// 	.flat();
							// event.push(...eventMessage);
							event = event.filter((e: string) => Utils.isValidAddress(e, 20));
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
						blockEvent = blockEvent.filter((e: string) => Utils.isValidAddress(e, 20));
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
				.filter((addr: string) => Utils.isValidAddress(addr, 20));
			// Filter list jobs to remove duplicates (if any)
			listUpdateInfo = listUpdateInfo.filter(this._onlyUnique);
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
										'@type': '/cosmos.gov.v1beta1.MsgVote',
										proposal_id: '146',
										voter: 'aura19zcrjqmhkz7c56s096hvc3pcm8n3l7q4ys25f6',
										option: 'VOTE_OPTION_YES',
									},
								],
								memo: '',
								timeout_height: '0',
								extension_options: [],
								non_critical_extension_options: [],
							},
							auth_info: {
								signer_infos: [
									{
										public_key: {
											'@type': '/cosmos.crypto.multisig.LegacyAminoPubKey',
											threshold: 2,
											public_keys: [
												{
													'@type': '/cosmos.crypto.secp256k1.PubKey',
													key: 'AiJZFGHFVdMYRLUazokS3WaJ2s3ItzoUoCmtugRleUfo',
												},
												{
													'@type': '/cosmos.crypto.secp256k1.PubKey',
													key: 'AnzfvSDKrREvWL7IcuSxTixnkaXecvjiiUp4dYaVZ8U/',
												},
											],
										},
										mode_info: {
											multi: {
												bitarray: {
													extra_bits_stored: 2,
													elems: 'wA==',
												},
												mode_infos: [
													{
														single: {
															mode: 'SIGN_MODE_LEGACY_AMINO_JSON',
														},
													},
													{
														single: {
															mode: 'SIGN_MODE_LEGACY_AMINO_JSON',
														},
													},
												],
											},
										},
										sequence: '4',
									},
								],
								fee: {
									amount: [
										{
											denom: 'uaura',
											amount: '211',
										},
									],
									gas_limit: '84034',
									payer: '',
									granter: '',
								},
							},
							signatures: [
								'CkAtOJzfSbTpGfwvgu/vuLDCgWc0jLw/gs0M2BSFqFIcBEelY78H/UTFdHsuD+87sNmwruT2bOeOE8xk1BF1TL/ACkAIavBaMt0T/ulxktmP14LPFdu+b/OMk1JSjqzaHMYzyjeKk8i+6Zss5b6A/sLWbql57FrbDH/Aio0fmRoJ/BXY',
							],
						},
						tx_response: {
							height: '11395659',
							txhash: '10F4710038B10235082D8807FD68066E649413B98100487D770DF0EAF0FB5E8B',
							codespace: 'gov',
							code: 3,
							data: '',
							raw_log:
								'failed to execute message; message index: 0: 146: inactive proposal',
							logs: [],
							info: '',
							gas_wanted: '84034',
							gas_used: '73504',
							tx: {
								'@type': '/cosmos.tx.v1beta1.Tx',
								body: {
									messages: [
										{
											'@type': '/cosmos.gov.v1beta1.MsgVote',
											proposal_id: '146',
											voter: 'aura19zcrjqmhkz7c56s096hvc3pcm8n3l7q4ys25f6',
											option: 'VOTE_OPTION_YES',
										},
									],
									memo: '',
									timeout_height: '0',
									extension_options: [],
									non_critical_extension_options: [],
								},
								auth_info: {
									signer_infos: [
										{
											public_key: {
												'@type':
													'/cosmos.crypto.multisig.LegacyAminoPubKey',
												threshold: 2,
												public_keys: [
													{
														'@type': '/cosmos.crypto.secp256k1.PubKey',
														key: 'AiJZFGHFVdMYRLUazokS3WaJ2s3ItzoUoCmtugRleUfo',
													},
													{
														'@type': '/cosmos.crypto.secp256k1.PubKey',
														key: 'AnzfvSDKrREvWL7IcuSxTixnkaXecvjiiUp4dYaVZ8U/',
													},
												],
											},
											mode_info: {
												multi: {
													bitarray: {
														extra_bits_stored: 2,
														elems: 'wA==',
													},
													mode_infos: [
														{
															single: {
																mode: 'SIGN_MODE_LEGACY_AMINO_JSON',
															},
														},
														{
															single: {
																mode: 'SIGN_MODE_LEGACY_AMINO_JSON',
															},
														},
													],
												},
											},
											sequence: '4',
										},
									],
									fee: {
										amount: [
											{
												denom: 'uaura',
												amount: '211',
											},
										],
										gas_limit: '84034',
										payer: '',
										granter: '',
									},
								},
								signatures: [
									'CkAtOJzfSbTpGfwvgu/vuLDCgWc0jLw/gs0M2BSFqFIcBEelY78H/UTFdHsuD+87sNmwruT2bOeOE8xk1BF1TL/ACkAIavBaMt0T/ulxktmP14LPFdu+b/OMk1JSjqzaHMYzyjeKk8i+6Zss5b6A/sLWbql57FrbDH/Aio0fmRoJ/BXY',
								],
							},
							timestamp: '2023-02-21T08:36:41Z',
							events: [
								{
									type: 'coin_spent',
									attributes: [
										{
											key: 'c3BlbmRlcg==',
											value: 'YXVyYTE5emNyanFtaGt6N2M1NnMwOTZodmMzcGNtOG4zbDdxNHlzMjVmNg==',
											index: true,
										},
										{
											key: 'YW1vdW50',
											value: 'MjExdWF1cmE=',
											index: true,
										},
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
										{
											key: 'YW1vdW50',
											value: 'MjExdWF1cmE=',
											index: true,
										},
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
											value: 'YXVyYTE5emNyanFtaGt6N2M1NnMwOTZodmMzcGNtOG4zbDdxNHlzMjVmNg==',
											index: true,
										},
										{
											key: 'YW1vdW50',
											value: 'MjExdWF1cmE=',
											index: true,
										},
									],
								},
								{
									type: 'message',
									attributes: [
										{
											key: 'c2VuZGVy',
											value: 'YXVyYTE5emNyanFtaGt6N2M1NnMwOTZodmMzcGNtOG4zbDdxNHlzMjVmNg==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'ZmVl',
											value: 'MjExdWF1cmE=',
											index: true,
										},
										{
											key: 'ZmVlX3BheWVy',
											value: 'YXVyYTE5emNyanFtaGt6N2M1NnMwOTZodmMzcGNtOG4zbDdxNHlzMjVmNg==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'YWNjX3NlcQ==',
											value: 'YXVyYTE5emNyanFtaGt6N2M1NnMwOTZodmMzcGNtOG4zbDdxNHlzMjVmNi80',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'TFRpYzMwbTA2Um44TDRMdjc3aXd3b0ZuTkl5OFA0TE5ETmdVaGFoU0hBUkhwV08vQi8xRXhYUjdMZy92TzdEWnNLN2s5bXpuamhQTVpOUVJkVXkvd0E9PQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'Q0dyd1dqTGRFLzdwY1pMWmo5ZUN6eFhidm0vempKTlNVbzZzMmh6R004bzNpcFBJdnVtYkxPVytnUDdDMW02cGVleGEyd3gvd0lxTkg1a2FDZndWMkE9PQ==',
											index: true,
										},
									],
								},
								{
									type: 'tx',
									attributes: [
										{
											key: 'c2lnbmF0dXJl',
											value: 'Q2tBdE9KemZTYlRwR2Z3dmd1L3Z1TERDZ1djMGpMdy9nczBNMkJTRnFGSWNCRWVsWTc4SC9VVEZkSHN1RCs4N3NObXdydVQyYk9lT0U4eGsxQkYxVEwvQUNrQUlhdkJhTXQwVC91bHhrdG1QMTRMUEZkdStiL09NazFKU2pxemFITVl6eWplS2s4aSs2WnNzNWI2QS9zTFdicWw1N0ZyYkRIL0FpbzBmbVJvSi9CWFk=',
											index: true,
										},
									],
								},
							],
						},
					},
				],
				source: CONST_CHAR.CRAWL,
				chainId: Config.CHAIN_ID,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
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
