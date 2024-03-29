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
import { CONST_CHAR, MSG_TYPE, URL_TYPE_CONSTANTS } from '../../common/constant';
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
		});
	}

	private async _handleJob(listTx: any, chainId: string) {
		const smartContracts: any[] = [];

		for (const txs of listTx) {
			this.logger.info(`Get smart contract from TxHash: ${txs.tx_response.txhash}`);
			for (const msg of txs.tx.body.messages) {
				const index = txs.tx.body.messages.indexOf(msg);
				if (
					txs.tx_response.logs[index].events.find(
						(x: any) => x.type === CONST_CHAR.INSTANTIATE,
					)
				) {
					const height = txs.tx_response.height;
					const tx_hash = txs.tx_response.txhash;
					let creator_address = msg.sender;
					if (msg['@type'] === MSG_TYPE.MSG_EXECUTE_CONTRACT) {
						creator_address = txs.tx_response.logs[index].events
							.find((x: any) => x.type === CONST_CHAR.EXECUTE)
							.attributes.find(
								(x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS,
							).value;
					}

					let contract_addresses;
					let code_ids;
					try {
						contract_addresses = txs.tx_response.logs[index].events
							.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS);
						code_ids = txs.tx_response.logs[index].events
							.find((x: any) => x.type === CONST_CHAR.INSTANTIATE)
							.attributes.filter((x: any) => x.key === CONST_CHAR.CODE_ID);
					} catch (error) {
						this.logger.error(`Error get attributes at TxHash ${tx_hash}`);
						this.logger.error(error);
					}
					if (code_ids && contract_addresses) {
						const mess = msg.msg;
						for (let i = 0; i < contract_addresses.length; i++) {
							const code_id = {
								id: code_ids[i].value,
								creator: '',
							};
							const contract_address = contract_addresses[i].value;
							const [
								num_tokens,
								token_info,
								marketing_info,
								contract_info,
								cosmwasm_code_id,
							] = await this.queryContractInfo(
								chainId,
								contract_addresses[i].value,
								code_ids[i].value,
							);
							let contract_hash;
							if (cosmwasm_code_id.code_info) {
								contract_hash = cosmwasm_code_id.code_info.data_hash.toLowerCase();
								code_id.creator = cosmwasm_code_id.code_info.creator;
							}
							let contract_name = null;
							if (token_info.name) {
								contract_name = token_info.name;
							} else if (contract_info.name) {
								contract_name = contract_info.name;
							}
							const smartContract = {
								_id: new Types.ObjectId(),
								contract_name,
								contract_address,
								contract_hash,
								creator_address,
								tx_hash,
								height,
								code_id,
								num_tokens,
								token_info,
								marketing_info,
								contract_info,
								msg: mess,
							} as ISmartContracts;
							smartContracts.push(smartContract);
						}
					}
				}
				if (
					txs.tx_response.logs[index].events.find(
						(x: any) => x.type === CONST_CHAR.EXECUTE,
					)
				) {
					const contractAddresses = txs.tx_response.logs[index].events
						.find((x: any) => x.type === CONST_CHAR.EXECUTE)
						.attributes.filter((x: any) => x.key === CONST_CHAR._CONTRACT_ADDRESS);
					await this._updateContractOnchainInfo(contractAddresses, chainId);
				}
			}
		}

		try {
			await this.adapter.insertMany(smartContracts);
		} catch (error) {
			this.logger.error('Duplicate contract(s) detected', smartContracts);
		}
	}

	private async _updateContractOnchainInfo(contractAddresses: any[], chainId: string) {
		const addresses = contractAddresses.map((c: any) => c.value).filter(this._onlyUnique);
		addresses.map(async (contract: string) => {
			const [numTokens, tokenInfo, marketingInfo, contractInfo] =
				await this.queryContractSmart(contract, chainId, undefined);
			/* eslint-disable camelcase, no-underscore-dangle */
			const executeContract = await this.adapter.findOne({
				contract_address: contract,
			});
			if (executeContract) {
				let num_tokens;
				let token_info;
				let contract_info;
				let marketing_info;
				if (numTokens?.data) {
					num_tokens = Number(numTokens.data.count);
				}
				if (tokenInfo?.data) {
					token_info = tokenInfo.data;
				}
				if (marketingInfo?.data) {
					marketing_info = marketingInfo.data;
				}
				if (contractInfo?.data) {
					contract_info = contractInfo.data;
				}
				await this.adapter.updateById(executeContract._id, {
					$set: {
						num_tokens,
						token_info,
						contract_info,
						marketing_info,
					},
				});
			}
		});
	}

	public async queryContractInfo(chainId: string, contractAddress: string, codeId: string) {
		const [numTokens, tokenInfo, marketingInfo, contractInfo, cosmwasmCodeId] =
			await this.queryContractSmart(contractAddress, chainId, codeId);

		return [
			numTokens.data ? Number(numTokens.data.count) : 0,
			tokenInfo.data ? tokenInfo.data : {},
			marketingInfo.data ? marketingInfo.data : {},
			contractInfo.data ? contractInfo.data : {},
			cosmwasmCodeId ? cosmwasmCodeId : {},
		];
	}

	private async queryContractSmart(contract: string, chainId: string, codeId?: string) {
		const base64RequestNumToken = Buffer.from('{ "num_tokens": {} }').toString('base64');
		const base64RequestTokenInfo = Buffer.from('{ "token_info": {} }').toString('base64');
		const base64RequestMarketingInfo = Buffer.from('{ "marketing_info": {} }').toString(
			'base64',
		);
		const base64RequestContractInfo = Buffer.from('{ "contract_info": {} }').toString('base64');
		const paramNumTokens = Config.CONTRACT_URI + `${contract}/smart/${base64RequestNumToken}`;
		const paramTokenInfo = Config.CONTRACT_URI + `${contract}/smart/${base64RequestTokenInfo}`;
		const paramMarketingInfo =
			Config.CONTRACT_URI + `${contract}/smart/${base64RequestMarketingInfo}`;
		const paramContractInfo =
			Config.CONTRACT_URI + `${contract}/smart/${base64RequestContractInfo}`;
		const url = Utils.getUrlByChainIdAndType(chainId, URL_TYPE_CONSTANTS.LCD);
		if (codeId) {
			const paramCosmWasmCodeId = `${Config.GET_DATA_HASH}${codeId}`;
			return await Promise.all([
				this.callApiFromDomain(url, paramNumTokens),
				this.callApiFromDomain(url, paramTokenInfo),
				this.callApiFromDomain(url, paramMarketingInfo),
				this.callApiFromDomain(url, paramContractInfo),
				this.callApiFromDomain(url, paramCosmWasmCodeId),
			]);
		}
		return await Promise.all([
			this.callApiFromDomain(url, paramNumTokens),
			this.callApiFromDomain(url, paramTokenInfo),
			this.callApiFromDomain(url, paramMarketingInfo),
			this.callApiFromDomain(url, paramContractInfo),
		]);
	}

	private _onlyUnique(value: any, index: any, self: any) {
		return self.indexOf(value) === index;
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
