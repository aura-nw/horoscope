/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
import createBullService from '../../mixins/customMoleculerBull';
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { Config } from '../../common';
import { MODULE_PARAM, URL_TYPE_CONSTANTS } from '../../common/constant';
import { IDelegationResponseFromLCD, IValidatorResponseFromLCD } from '../../types';
import { Job } from 'bull';
import { IParam, ISlashingParam, IValidator, SlashingParam, ValidatorEntity } from '../../entities';
import { Utils } from '../../utils/utils';

export default class CrawlValidatorService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbValidatorMixin = dbValidatorMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlValidator',
			version: 1,
			mixins: [
				createBullService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.staking.validator',
					},
				),
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
			query: { 'custom_info.chain_id': Config.CHAIN_ID },
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
			validator.consensus_hex_address = Utils.pubkeyBase64ToHexAddress(
				validator.consensus_pubkey.key.toString(),
			);
			let address = Utils.operatorAddressToAddress(
				validator.operator_address.toString(),
				Config.NETWORK_PREFIX_ADDRESS,
			);
			validator.account_address = address;
			let pathDelegation = `${
				Config.GET_ALL_VALIDATOR
			}/${validator.operator_address.toString()}/delegations/${address}`;
			let resultCallApiDelegation: IDelegationResponseFromLCD = await this.callApiFromDomain(
				url,
				pathDelegation,
			);
			if (
				resultCallApiDelegation &&
				resultCallApiDelegation.delegation_response &&
				resultCallApiDelegation.delegation_response.balance
			) {
				validator.self_delegation_balance =
					resultCallApiDelegation.delegation_response.balance;
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
			this.logger.debug(`result: ${JSON.stringify(resultCallApiDelegation)}`);
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
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.staking.validator').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});

		return super._start();
	}
}
