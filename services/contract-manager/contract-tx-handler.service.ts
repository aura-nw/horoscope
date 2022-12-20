/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable camelcase */
import { Service, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { Types } from 'mongoose';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbSmartContractsMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
import { Config } from '../../common';
import { CONST_CHAR, MSG_TYPE, PATH_COSMOS_SDK, URL_TYPE_CONSTANTS } from '../../common/constant';
import { ISmartContracts } from '../../model';
import { Utils } from '../../utils/utils';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlSmartContractsService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'contractTxHandle',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbSmartContractsMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'contract.tx-handle': {
					concurrency: parseInt(Config.CONCURRENCY_HANDLE_CONTRACT_TX, 10),
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						// eslint-disable-next-line no-underscore-dangle
						await this._handleJob(job.data.listTx, job.data.chainId);
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

	private async _handleJob(listTx: any, chainId: string) {
		const smartContracts: any[] = [];

		for (const txs of listTx) {
			this.logger.info(`Get smart contract from TxHash: ${txs.tx_response.txhash}`);
			for (const msg of txs.tx.body.messages) {
				switch (msg['@type']) {
					case MSG_TYPE.MSG_INSTANTIATE_CONTRACT:
						const instant_contract_name = msg.label;
						const instant_height = txs.tx_response.height;
						const instant_creator_address = msg.sender;
						const instant_tx_hash = txs.tx_response.txhash;
						let instant_contract_addresses;
						let instant_code_ids;
						try {
							instant_contract_addresses = txs.tx_response.logs[0].events
								.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
								// eslint-disable-next-line no-underscore-dangle
								.attributes.filter(
									(x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS,
								);
							instant_code_ids = txs.tx_response.logs[0].events
								.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
								.attributes.filter((x: any) => x.key === CONST_CHAR.CODE_ID);
						} catch (error) {
							this.logger.error(`Error get attributes at TxHash ${instant_tx_hash}`);
							this.logger.error(error);
						}
						if (instant_code_ids && instant_contract_addresses) {
							const mess = msg.msg;
							for (let i = 0; i < instant_contract_addresses.length; i++) {
								const code_id = {
									id: instant_code_ids[i].value,
									creator: '',
								};
								const contract_address = instant_contract_addresses[i].value;
								const [
									token_info,
									marketing_info,
									contract_info,
									cosmwasm_code_id,
								] = await this.queryContractInfo(
									chainId,
									instant_contract_addresses[i].value,
									instant_code_ids[i].value,
								);
								let contract_hash;
								if (cosmwasm_code_id.code_info) {
									contract_hash =
										cosmwasm_code_id.code_info.data_hash.toLowerCase();
									code_id.creator = cosmwasm_code_id.code_info.creator;
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
									contract_info,
									msg: mess,
								} as ISmartContracts;
								smartContracts.push(smartContract);
							}
						}
						break;
					case MSG_TYPE.MSG_EXECUTE_CONTRACT:
						// eslint-disable-next-line no-underscore-dangle
						await this._updateContractNumTokens(msg, chainId);
						const tx_hash = txs.tx_response.txhash;
						const height = txs.tx_response.height;
						let contract_addresses;
						let code_ids;
						try {
							contract_addresses = txs.tx_response.logs[0].events
								.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
								// eslint-disable-next-line no-underscore-dangle
								.attributes.filter(
									(x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS,
								);
							code_ids = txs.tx_response.logs[0].events
								.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
								.attributes.filter((x: any) => x.key === CONST_CHAR.CODE_ID);
						} catch (error) {
							this.logger.error(`Error get attributes at TxHash ${tx_hash}`);
							this.logger.error(error);
						}
						if (code_ids && contract_addresses) {
							const executeMess = msg.msg;
							for (let i = 0; i < contract_addresses.length; i++) {
								const code_id = {
									id: code_ids[i].value,
									creator: '',
								};
								const contract_address = contract_addresses[i].value;
								const creator_address = txs.tx_response.logs[0].events
									.find((x: any) => x.type === CONST_CHAR.EXECUTE)
									.attributes.find(
										// eslint-disable-next-line no-underscore-dangle
										(x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS,
									).value;
								const url = Utils.getUrlByChainIdAndType(
									chainId,
									URL_TYPE_CONSTANTS.LCD,
								);
								const [
									token_info,
									marketing_info,
									contract_info,
									cosmwasm_code_id,
								] = await this.queryContractInfo(
									chainId,
									contract_address,
									code_ids[i].value,
								);
								let cosmwasm_contract;
								try {
									cosmwasm_contract = await this.callApiFromDomain(
										url,
										`${PATH_COSMOS_SDK.COSMWASM_CONTRACT_PARAM}${contract_address}`,
									);
								} catch (error) {
									this.logger.error(error);
								}
								let contract_hash;
								if (cosmwasm_code_id.code_info) {
									contract_hash =
										cosmwasm_code_id.code_info.data_hash.toLowerCase();
									code_id.creator = cosmwasm_code_id.code_info.creator;
								}
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
									contract_info,
									msg: executeMess,
								} as ISmartContracts;
								smartContracts.push(smartContract);
							}
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

	private async _updateContractNumTokens(msg: any, chainId: string) {
		const burnOrMintMessages = !!msg.msg?.mint?.token_id || !!msg.msg?.burn?.token_id;
		if (burnOrMintMessages) {
			this.logger.info(
				`Call contract lcd api to query num_tokens with parameter: {contract_address: ${msg.contract}}`,
			);
			const base64RequestNumToken = Buffer.from('{ "num_tokens": {} }').toString('base64');
			const param = Config.CONTRACT_URI + `${msg.contract}/smart/${base64RequestNumToken}`;
			const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
			const result = await this.callApiFromDomain(url, param);
			/* eslint-disable camelcase, no-underscore-dangle */
			const executeContract = await this.adapter.findOne({ contract_address: msg.contract });
			if (result?.data !== 0 && executeContract) {
				await this.adapter.updateById(executeContract._id, {
					$set: { num_tokens: Number(result.data.count) },
				});
			}
		}
	}

	public async queryContractInfo(chainId: string, contractAddress: string, codeId: string) {
		const base64RequestTokenInfo = Buffer.from('{ "token_info": {} }').toString('base64');
		const base64RequestMarketingInfo = Buffer.from('{ "marketing_info": {} }').toString(
			'base64',
		);
		const base64RequestContractInfo = Buffer.from('{ "contract_info": {} }').toString('base64');
		const paramTokenInfo =
			Config.CONTRACT_URI + `${contractAddress}/smart/${base64RequestTokenInfo}`;
		const paramMarketingInfo =
			Config.CONTRACT_URI + `${contractAddress}/smart/${base64RequestMarketingInfo}`;
		const paramContractInfo =
			Config.CONTRACT_URI + `${contractAddress}/smart/${base64RequestContractInfo}`;
		const paramCosmWasmCodeId = `${Config.GET_DATA_HASH}${codeId}`;
		const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
		const [tokenInfo, marketingInfo, contractInfo, cosmwasmCodeId] = await Promise.all([
			this.callApiFromDomain(url, paramTokenInfo),
			this.callApiFromDomain(url, paramMarketingInfo),
			this.callApiFromDomain(url, paramContractInfo),
			this.callApiFromDomain(url, paramCosmWasmCodeId),
		]);

		return [
			tokenInfo.data ? tokenInfo.data : {},
			marketingInfo.data ? marketingInfo.data : {},
			contractInfo.data ? contractInfo.data : {},
			cosmwasmCodeId ? cosmwasmCodeId : {},
		];
	}

	public async _start() {
		this.getQueue('contract.tx-handle').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('contract.tx-handle').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('contract.tx-handle').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
