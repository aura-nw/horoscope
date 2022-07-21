/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { JsonConvert, OperationMode } from 'json2typescript';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { IValidatorResponseFromLCD } from '../../types';
import { Job } from 'bull';
import { IValidator, ValidatorEntity } from '../../entities';
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
				QueueService(
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

		listValidator.forEach(async (validator) => {
			let foundValidator = await this.adapter.findOne({
				operator_address: `${validator.operator_address}`,
				'custom_info.chain_id': Config.CHAIN_ID,
			});
			try {
				if (foundValidator) {
					validator._id = foundValidator._id;
					validator.consensus_hex_address = Utils.pubkeyBase64ToHexAddress(
						validator.consensus_pubkey.key.toString(),
					);
					let result = await this.adapter.updateById(foundValidator._id, validator);
				} else {
					const item: ValidatorEntity = new JsonConvert().deserializeObject(
						validator,
						ValidatorEntity,
					);
					item.consensus_hex_address = Utils.pubkeyBase64ToHexAddress(
						item.consensus_pubkey.key.toString(),
					);
					let id = await this.adapter.insert(item);
				}
				// this.broker.emit('validator.upsert', { address: validator.operator_address });
			} catch (error) {
				this.logger.error(error);
			}
		});
		let listAddress: string[] = listValidator.map((item) => item.operator_address.toString());
		if (listAddress.length > 0) {
			this.broker.emit('validator.upsert', { listAddress: listAddress });
		}
	}

	async _start() {
		this.createJob(
			'crawl.staking.validator',
			{
				url: `${Config.GET_ALL_VALIDATOR}?pagination.limit=${Config.NUMBER_OF_VALIDATOR_PER_CALL}`,
			},
			{
				removeOnComplete: true,
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
