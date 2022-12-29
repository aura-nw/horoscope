/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { JsonConvert } from 'json2typescript';
import { Job } from 'bull';
import { pubkeyToRawAddress } from '@cosmjs/tendermint-rpc';
import { fromBase64, toHex, fromBech32, toBech32 } from '@cosmjs/encoding';
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { IDelegationResponseFromLCD, IValidatorResponseFromLCD } from '../../types';
import { IValidator, ValidatorEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
export default class CrawlValidatorService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlValidator',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbValidatorMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.staking.validator': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob() {
		const path = `${Config.GET_ALL_VALIDATOR}?pagination.limit=${Config.NUMBER_OF_VALIDATOR_PER_CALL}`;
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
		const listValidatorInDB: IValidator[] = await this.adapter.find({
			query: {},
		});
		const listBulk: any[] = [];
		listValidator = await Promise.all(
			listValidator.map(async (validator) => this.loadCustomInfo(validator)),
		);
		listValidator.map((validator) => {
			const foundValidator = listValidatorInDB.find(
				(validatorInDB: IValidator) =>
					validatorInDB.operator_address === validator.operator_address,
			);
			try {
				// Validator = await this.loadCustomInfo(validator);
				if (foundValidator) {
					// eslint-disable-next-line no-underscore-dangle
					validator._id = foundValidator._id;

					// Let result = await this.adapter.updateById(foundValidator._id, validator);
					listBulk.push({
						updateOne: {
							// eslint-disable-next-line no-underscore-dangle
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
					// Let id = await this.adapter.insert(item);
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
		const result = await this.adapter.bulkWrite(listBulk);
		// Await this.adapter.clearCache();
		this.logger.info(`Bulkwrite validator: ${listValidator.length}`, result);
		const listAddress: string[] = listValidator.map((item) => item.operator_address.toString());
		if (listAddress.length > 0) {
			this.broker.emit('validator.upsert', { listAddress });
		}
	}

	async loadCustomInfo(validator: IValidator): Promise<IValidator> {
		try {
			const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
			let rawAddress: any = pubkeyToRawAddress(
				'ed25519',
				fromBase64(validator.consensus_pubkey.key.toString()),
			);
			rawAddress = toHex(rawAddress).toUpperCase();
			// eslint-disable-next-line camelcase
			validator.consensus_hex_address = rawAddress;
			const address = toBech32(
				Config.NETWORK_PREFIX_ADDRESS,
				fromBech32(validator.operator_address.toString()).data,
			);
			// eslint-disable-next-line camelcase
			validator.account_address = address;

			const pathSelfDelegation = `${Config.GET_ALL_VALIDATOR
				}/${validator.operator_address.toString()}/delegations/${address}`;

			const resultSelfBonded: IDelegationResponseFromLCD = await this.callApiFromDomain(
				url,
				pathSelfDelegation,
				1,
			);
			if (
				resultSelfBonded &&
				resultSelfBonded.delegation_response &&
				resultSelfBonded.delegation_response.balance
			) {
				// eslint-disable-next-line camelcase
				validator.self_delegation_balance = resultSelfBonded.delegation_response.balance;
			}

			const poolResult: any = await this.broker.call(
				'v1.crawlPool.find',
				{
					query: {
						'custom_info.chain_id': Config.CHAIN_ID,
					},
				},
				{ meta: { $cache: false } },
			);
			if (poolResult && poolResult.length > 0) {
				const percentVotingPower =
					Number(
						(BigInt(validator.tokens.toString()) * BigInt(100000000)) /
						BigInt(poolResult[0].bonded_tokens),
					) / 1000000;
				// eslint-disable-next-line camelcase
				validator.percent_voting_power = percentVotingPower;
			}
			this.logger.debug(`result: ${JSON.stringify(resultSelfBonded)}`);
		} catch (error) {
			this.logger.error(error);
		}

		return validator;
	}

	public async _start() {
		this.createJob(
			'crawl.staking.validator',
			{},
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
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
