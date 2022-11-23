/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert } from 'json2typescript';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { IValidatorResponseFromLCD } from '../../types';
import { Job } from 'bull';
import { IValidator, ValidatorEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { QueueConfig } from '../../config/queue';
import { pubkeyToRawAddress } from '@cosmjs/tendermint-rpc';
import { fromBase64, toHex, fromBech32, toBech32 } from '@cosmjs/encoding';
export default class CrawlValidatorService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbValidatorMixin = dbValidatorMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlValidator',
			version: 1,
			mixins: [
				QueueService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbValidatorMixin,
			],
			queues: {
				'crawl.staking.validator': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.url);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob(path: String) {
		let listValidator: IValidator[] = [];

		let param = path;
		let resultCallApi: IValidatorResponseFromLCD;

		let done = false;
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		while (!done) {
			resultCallApi = await this.callApiFromDomain(url, param);

			listValidator.push(...resultCallApi.validators);
			if (resultCallApi.pagination.next_key === null) {
				done = true;
			} else {
				param = `${path}&pagination.key=${encodeURIComponent(
					resultCallApi.pagination.next_key.toString(),
				)}`;
			}
		}

		this.logger.debug(`result: ${JSON.stringify(listValidator)}`);
		let listValidatorInDB: IValidator[] = await this.adapter.find({
			query: {},
		});
		let listBulk: any[] = [];
		listValidator = await Promise.all(
			listValidator.map((validator) => {
				return this.loadCustomInfo(validator);
			}),
		);
		listValidator.map((validator) => {
			let foundValidator = listValidatorInDB.find((validatorInDB: IValidator) => {
				return validatorInDB.operator_address === validator.operator_address;
			});
			try {
				// validator = await this.loadCustomInfo(validator);
				if (foundValidator) {
					validator._id = foundValidator._id;

					// let result = await this.adapter.updateById(foundValidator._id, validator);
					listBulk.push({
						updateOne: {
							filter: { _id: foundValidator._id },
							update: validator,
							upsert: true,
						},
					});
				} else {
					const item: ValidatorEntity = new JsonConvert().deserializeObject(
						validator,
						ValidatorEntity,
					);
					// let id = await this.adapter.insert(item);
					listBulk.push({
						insertOne: {
							document: item,
						},
					});
				}
			} catch (error) {
				this.logger.error(error);
			}
		});
		let result = await this.adapter.bulkWrite(listBulk);
		// await this.adapter.clearCache();
		this.logger.info(`Bulkwrite validator: ${listValidator.length}`, result);
		let listAddress: string[] = listValidator.map((item) => item.operator_address.toString());
		if (listAddress.length > 0) {
			this.broker.emit('validator.upsert', { listAddress: listAddress });
		}
	}

	async loadCustomInfo(validator: IValidator): Promise<IValidator> {
		try {
			const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
			let consensus_hex_address: any = pubkeyToRawAddress(
				'ed25519',
				fromBase64(validator.consensus_pubkey.key.toString()),
			);
			consensus_hex_address = toHex(consensus_hex_address).toUpperCase();
			validator.consensus_hex_address = consensus_hex_address;
			let address = toBech32(
				Config.NETWORK_PREFIX_ADDRESS,
				fromBech32(validator.operator_address.toString()).data,
			);
			validator.account_address = address;
			let pathDelegation = `${
				Config.GET_ALL_VALIDATOR
			}/${validator.operator_address.toString()}/delegations/${address}`;

			let pathAllDelegation = `${
				Config.GET_ALL_VALIDATOR
			}/${validator.operator_address.toString()}/delegations?pagination.limit=1&pagination.count_total=true`;

			// let resultSelfBonded: IDelegationResponseFromLCD = await this.callApiFromDomain(
			// 	url,
			// 	pathDelegation,
			// );
			let resultAllDelegation: any = null;
			let resultSelfBonded: any = null;
			// let [resultSelfBonded]: [
			// 	IDelegationResponseFromLCD,
			// ] = await Promise.all([
			// 	this.callApiFromDomain(url, pathDelegation),
			// 	// this.callApiFromDomain(url, pathAllDelegation),
			// ]);
			if (
				resultSelfBonded &&
				resultSelfBonded.delegation_response &&
				resultSelfBonded.delegation_response.balance
			) {
				validator.self_delegation_balance = resultSelfBonded.delegation_response.balance;
			}

			let poolResult: any = await this.broker.call(
				'v1.crawlPool.find',
				{
					query: {
						'custom_info.chain_id': Config.CHAIN_ID,
					},
				},
				{ meta: { $cache: false } },
			);
			if (poolResult && poolResult.length > 0) {
				const percent_voting_power =
					Number(
						(BigInt(validator.tokens.toString()) * BigInt(100000000)) /
							BigInt(poolResult[0].bonded_tokens),
					) / 1000000;
				validator.percent_voting_power = percent_voting_power;
			}
			this.logger.debug(`result: ${JSON.stringify(resultSelfBonded)}`);

			if (
				resultAllDelegation &&
				resultAllDelegation.pagination &&
				resultAllDelegation.pagination.total
			) {
				validator.number_delegators = Number(resultAllDelegation.pagination.total);
			}
		} catch (error) {
			this.logger.error(error);
		}

		return validator;
	}

	async _start() {
		this.createJob(
			'crawl.staking.validator',
			{
				url: `${Config.GET_ALL_VALIDATOR}?pagination.limit=${Config.NUMBER_OF_VALIDATOR_PER_CALL}`,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_VALIDATOR, 10),
				},
			},
		);

		this.getQueue('crawl.staking.validator').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.staking.validator').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.failedReason}`);
		});
		this.getQueue('crawl.staking.validator').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
