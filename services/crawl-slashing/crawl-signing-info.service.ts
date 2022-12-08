/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, Context, ServiceBroker } from 'moleculer';
import { Job } from 'bull';
import { fromBase64, toBech32 } from '@cosmjs/encoding';
import { pubkeyToRawAddress } from '@cosmjs/tendermint-rpc';
import { dbValidatorMixin } from '../../mixins/dbMixinMongoose';
import { Config } from '../../common';
import { LIST_NETWORK, MODULE_PARAM, URL_TYPE_CONSTANTS } from '../../common/constant';
import { ISigningInfoEntityResponseFromLCD, ListValidatorAddress } from '../../types';
import { IValidator, ParamEntity } from '../../entities';
import { Utils } from '../../utils/utils';
import { queueConfig } from '../../config/queue';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');
export default class CrawlSigningInfoService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlSigningInfo',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbValidatorMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'crawl.signinginfo': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.listAddress);
						job.progress(100);
						return true;
					},
				},
			},
			events: {
				'validator.upsert': {
					handler: (ctx: Context<ListValidatorAddress, Record<string, unknown>>) => {
						this.handleJob(ctx.params.listAddress);
						return;
					},
				},
			},
		});
	}

	async handleJob(listAddress: string[]) {
		const listFoundValidator: IValidator[] = await this.adapter.find({
			query: {
				// eslint-disable-next-line camelcase
				operator_address: {
					$in: listAddress,
				},
			},
		});
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);
		const prefixAddress = LIST_NETWORK.find(
			(item) => item.chainId === Config.CHAIN_ID,
		)?.prefixAddress;
		const paramSlashing: ParamEntity[] = await this.broker.call('v1.crawlparam.find', {
			query: {
				module: MODULE_PARAM.SLASHING,
			},
		});
		let listBulk: any[] = await Promise.all(
			listFoundValidator.map(async (foundValidator: IValidator) => {
				try {
					const consensusPubkey = foundValidator.consensus_pubkey;
					this.logger.debug(
						`Found validator with address ${foundValidator.operator_address}`,
					);
					this.logger.debug(`Found validator with consensusPubkey ${consensusPubkey}`);

					const address = pubkeyToRawAddress(
						'ed25519',
						fromBase64(consensusPubkey.key.toString()),
					);

					const consensusAddress = toBech32(
						`${prefixAddress}${Config.CONSENSUS_PREFIX_ADDRESS}`,
						address,
					);
					const path = `${Config.GET_SIGNING_INFO}/${consensusAddress}`;

					this.logger.debug(path);
					const result: ISigningInfoEntityResponseFromLCD = await this.callApiFromDomain(
						url,
						path,
					);
					this.logger.debug(result);

					if (result.val_signing_info) {
						let uptime = 0;
						if (paramSlashing.length > 0) {
							const blockWindow =
								// @ts-ignore
								paramSlashing[0].params?.signed_blocks_window.toString();
							const missedBlock =
								result.val_signing_info.missed_blocks_counter.toString();
							uptime =
								Number(
									((BigInt(blockWindow) - BigInt(missedBlock)) *
										BigInt(100000000)) /
										BigInt(blockWindow),
								) / 1000000;
						}
						return {
							updateOne: {
								// eslint-disable-next-line no-underscore-dangle
								filter: { _id: foundValidator._id },
								update: {
									$set: {
										// eslint-disable-next-line camelcase
										val_signing_info: result.val_signing_info,
										uptime,
									},
								},
								upsert: true,
							},
						};
					}
				} catch (error) {
					this.logger.error(error);
				}
				return;
			}),
		);

		listBulk = listBulk.filter((element) => element !== undefined);

		const resultBulkWrite = await this.adapter.bulkWrite(listBulk);
		this.logger.info(`result : ${listBulk.length} `, resultBulkWrite);
	}

	public async _start() {
		this.getQueue('crawl.signinginfo').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('crawl.signinginfo').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.failedReason);
		});
		this.getQueue('crawl.signinginfo').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
