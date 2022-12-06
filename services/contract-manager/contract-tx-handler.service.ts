import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { dbSmartContractsMixin } from '../../mixins/dbMixinMongoose';
import { QueueConfig } from '../../config/queue';
import { Config } from '../../common';
import { Job } from 'bull';
import {
	CONST_CHAR,
	LIST_NETWORK,
	MSG_TYPE,
	PATH_COSMOS_SDK,
	URL_TYPE_CONSTANTS,
} from '../../common/constant';
import { ISmartContracts } from '../../model';
import { Types } from 'mongoose';
import { Utils } from '../../utils/utils';
const QueueService = require('moleculer-bull');

export default class CrawlSmartContractsService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbContractsMixin = dbSmartContractsMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'contractTxHandle',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.dbContractsMixin,
				this.callApiMixin,
			],
			queues: {
				'contract.tx-handle': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_CONTRACT_TX, 10),
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
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'contract.tx-handle',
							{
								listTx: ctx.params.listTx,
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

	async handleJob(listTx: any, chainId: string) {
		let smartContracts: any[] = [];

		for (let txs of listTx) {
			this.logger.info(`Get smart contract from TxHash: ${txs.tx_response.txhash}`);
			for (let msg of txs.tx.body.messages) {
				switch (msg['@type']) {
					case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
						const instant_contract_name = msg.label;
						const instant_height = txs.tx_response.height;
						const instant_creator_address = msg.sender;
						const instant_tx_hash = txs.tx_response.txhash;
						const instant_contract_addresses = txs.tx_response.logs[0].events
							.find((x: any) => x.type == CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key == CONST_CHAR._CONTRACT_ADDRESS);
						const instant_code_ids = txs.tx_response.logs[0].events
							.find((x: any) => x.type == CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key == CONST_CHAR.CODE_ID);
						for (let i = 0; i < instant_contract_addresses.length; i++) {
							const code_id = instant_code_ids[i].value;
							const contract_address = instant_contract_addresses[i].value;
							const [token_info, marketing_info] =
								await this.queryContractInfo(chainId, instant_contract_addresses[i].value);
							let contract_hash;
							try {
								const param = Config.GET_DATA_HASH + code_id;
								const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
								contract_hash = (await this.callApiFromDomain(url, param))
									.code_info.data_hash.toLowerCase();
							} catch (error) {
								this.logger.error(error);
							}
							const smartContract = {
								_id: new Types.ObjectId(),
								contract_name: instant_contract_name,
								contract_address,
								contract_hash,
								creator_address: instant_creator_address,
								tx_hash: instant_tx_hash,
								height: instant_height,
								code_id,
								num_tokens: 0,
								token_info,
								marketing_info,
							} as ISmartContracts;
							smartContracts.push(smartContract);
						}
						break;
					case MSG_TYPE.MSG_EXECUTE_CONTRACT:
						await this.updateContractNumTokens(msg, chainId);
						const tx_hash = txs.tx_response.txhash;
						const height = txs.tx_response.height;
						const contract_addresses = txs.tx_response.logs[0].events
							.find((x: any) => x.type == CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key == CONST_CHAR._CONTRACT_ADDRESS);
						const code_ids = txs.tx_response.logs[0].events
							.find((x: any) => x.type == CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key == CONST_CHAR.CODE_ID);
						for (let i = 0; i < contract_addresses.length; i++) {
							const code_id = code_ids[i].value;
							const contract_address = contract_addresses[i].value;
							const creator_address = txs.tx_response.logs[0].events
								.find((x: any) => x.type == CONST_CHAR.EXECUTE)
								.attributes.find(
									(x: any) => x.key == CONST_CHAR._CONTRACT_ADDRESS,
								).value;
							const URL = Utils.getUrlByChainIdAndType(
								chainId,
								URL_TYPE_CONSTANTS.LCD,
							);
							let contract_hash, cosmwasm_contract;
							const [token_info, marketing_info] = await this.queryContractInfo(chainId, contract_address);
							try {
								const param = Config.GET_DATA_HASH + code_id;
								const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
								contract_hash = (await this.callApiFromDomain(url, param))
									.code_info.data_hash.toLowerCase();
								[contract_hash, cosmwasm_contract] = await Promise.all([
									this.callApiFromDomain(url, param),
									this.callApiFromDomain(
										URL,
										PATH_COSMOS_SDK.COSMWASM_CONTRACT_PARAM + contract_address,
									),
								]);
							} catch (error) {
								this.logger.error(error);
							}
							contract_hash = contract_hash.code_info.data_hash.toLowerCase();
							const smartContract = {
								_id: new Types.ObjectId(),
								contract_name: cosmwasm_contract.contract_info.label,
								contract_address,
								contract_hash,
								creator_address,
								tx_hash,
								height,
								code_id,
								num_tokens: 0,
								token_info,
								marketing_info,
							} as ISmartContracts;
							smartContracts.push(smartContract);
						}
						break;
				}
			}
		}

		try {
			await this.adapter.insertMany(smartContracts);
		} catch (error) {
			this.logger.error('Duplicate contract(s) detected', smartContracts);
		}
	}

	async updateContractNumTokens(msg: any, chainId: string) {
		const burnOrMintMessages = !!msg.msg?.mint?.token_id || !!msg.msg?.burn?.token_id;
		if (burnOrMintMessages) {
			this.logger.info(
				`Call contract lcd api to query num_tokens with parameter: {contract_address: ${msg.contract}}`,
			);
			const base64RequestNumToken = Buffer.from(`{ "num_tokens": {} }`).toString('base64');
			const param = Config.CONTRACT_URI + `${msg.contract}/smart/${base64RequestNumToken}`;
			const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
			let result = await this.callApiFromDomain(url, param);

			let executeContract = await this.adapter.findOne({ contract_address: msg.contract });
			if (result?.data !== 0 && executeContract) {
				await this.adapter.updateById(executeContract._id, {
					$set: { num_tokens: Number(result.data.count) },
				});
			}
		}
	}

	async queryContractInfo(chainId: string, contract_address: string) {
		const base64RequestTokenInfo = Buffer.from(`{ "token_info": {} }`).toString('base64');
		const base64RequestMarketingInfo = Buffer.from(`{ "marketing_info": {} }`).toString('base64');
		const paramTokenInfo = Config.CONTRACT_URI + `${contract_address}/smart/${base64RequestTokenInfo}`;
		const paramMarketingInfo = Config.CONTRACT_URI + `${contract_address}/smart/${base64RequestMarketingInfo}`;
		const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
		const [tokenInfo, marketingInfo] = await Promise.all([
			this.callApiFromDomain(url, paramTokenInfo),
			this.callApiFromDomain(url, paramMarketingInfo),
		]);

		return [tokenInfo.data ? tokenInfo.data : {}, marketingInfo.data ? marketingInfo.data : {}];
	}

	async _start() {
		this.getQueue('contract.tx-handle').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('contract.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('contract.tx-handle').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
