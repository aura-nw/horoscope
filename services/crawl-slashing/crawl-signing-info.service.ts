/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { Service, Context, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { SigningInfoEntityResponseFromApi } from 'types';
import { ValidatorEntity } from 'entities';
const tmhash = require('tendermint/lib/hash');
import { bech32 } from 'bech32';
import { Utils } from '../../utils/utils';

export default class CrawlSigningInfoService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbValidatorMixin = dbValidatorMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlSigningInfo',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.signinginfo',
					},
				),
				this.callApiMixin,
				this.dbValidatorMixin,
			],
			queues: {
				'crawl.signinginfo': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.address);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'validator.upsert': {
					handler: (ctx: any) => {
						this.createJob(
							'crawl.signinginfo',
							{
								address: ctx.params.address,
							},
							{
								removeOnComplete: true,
							},
						);
						return;
					},
				},
			},
		});
	}

	async handleJob(address: String) {
		let foundValidator: ValidatorEntity = await this.adapter.findOne({
			operator_address: `${address}`,
		});
		if (foundValidator) {
			try {
				let consensusPubkey = foundValidator.consensus_pubkey;
				this.logger.info(`Found validator with address ${address}`);
				this.logger.info(`Found validator with consensusPubkey ${consensusPubkey}`);

				const pubkey = this.getAddressHexFromPubkey(consensusPubkey.key.toString());
				const consensusAddress = this.hexToBech32(
					pubkey,
					`${Config.NETWORK_PREFIX_ADDRESS}${Config.CONSENSUS_PREFIX_ADDRESS}`,
				);
				let path = `${Config.GET_SIGNING_INFO}/${consensusAddress}`;
				const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

				let result: SigningInfoEntityResponseFromApi = await this.callApiFromDomain(
					url,
					path,
				);
				this.logger.info(result);
				let res = await this.adapter.updateById(foundValidator._id, {
					$set: { val_signing_info: result.val_signing_info },
				});
				this.logger.info(res);
			} catch (error) {
				this.logger.error(error);
			}
		}
	}
	getAddressHexFromPubkey(pubkey: string) {
		var bytes = Buffer.from(pubkey, 'base64');
		return tmhash.tmhash(bytes).slice(0, 20).toString('hex').toUpperCase();
	}

	hexToBech32(address: string, prefix: string) {
		let addressBuffer = Buffer.from(address, 'hex');
		return bech32.encode(prefix, bech32.toWords(addressBuffer));
	}
	async _start() {
		this.createJob(
			'crawl.signinginfo',
			{
				address: 'auravaloper1p5kp36qlmmczrk56veztdt0re4ly7uzrua9hqs',
			},
			{
				removeOnComplete: true,
			},
		);
		this.getQueue('crawl.signinginfo').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.signinginfo').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('crawl.signinginfo').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		return super._start();
	}
}
