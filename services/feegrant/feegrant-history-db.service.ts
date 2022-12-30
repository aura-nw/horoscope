/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Job } from 'bull';
import { FeegrantEntity } from 'entities';
import _ from 'lodash';
import { CallingOptions, Service, ServiceBroker } from 'moleculer';
import { Config } from '../../common';
import { FEEGRANT_ACTION, FEEGRANT_STATUS } from '../../common/constant';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { dbFeegrantHistoryMixin } from '../../mixins/dbMixinMongoose';
import { queueConfig } from '../../config/queue';
import { IFeegrantData } from './feegrant-tx-handler.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class CrawlAccountInfoService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'feegrantHistoryDb',
			version: 1,
			mixins: [
				queueService(queueConfig.redis, queueConfig.opts),
				dbFeegrantHistoryMixin,
				new CallApiMixin().start(),
			],
			queues: {
				'feegrant.history-db': {
					concurrency: 1,
					process(job: Job) {
						job.progress(10);
						// @ts-ignore
						this.handleJob(job.data.feegrantList, job.data.chainId);
						job.progress(100);
						return true;
					},
				},
			},
			dependencies: ['v1.feegrantDb'],
		});
	}

	async handleJob(feegrantList: IFeegrantData[], chainId: string): Promise<any[]> {
		// List history feegrant action
		const records: any[] = [];
		const recordsCreate: any[] = [];
		feegrantList.forEach(async (element) => {
			switch (element.action) {
				case FEEGRANT_ACTION.CREATE: {
					// Normal create
					const record = {
						...element,
						status: element.result ? FEEGRANT_STATUS.AVAILABLE : FEEGRANT_STATUS.FAIL,
						_id: null,
						action: FEEGRANT_ACTION.CREATE,
						/* eslint-disable camelcase */
						origin_feegrant_txhash: element.tx_hash,
					} as FeegrantEntity;
					record.amount = element.spend_limit;
					records.push(record);
					recordsCreate.push(record);
					break;
				}
				case FEEGRANT_ACTION.USE: {
					// Normal use feegrant
					const record = {
						...element,
						status: FEEGRANT_STATUS.AVAILABLE,
						_id: null,
						action: FEEGRANT_ACTION.USE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					record.granter = element.payer;
					records.push(record);
					break;
				}
				case FEEGRANT_ACTION.USE_UP: {
					// Useup feegrant
					// Record use
					const recordUse = {
						...element,
						status: FEEGRANT_STATUS.USE_UP,
						_id: null,
						action: FEEGRANT_ACTION.USE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					recordUse.granter = element.payer;
					recordUse.type = '';
					records.push(recordUse);
					// Record revoke
					const recordRevoke = {
						...element,
						status: FEEGRANT_STATUS.USE_UP,
						_id: null,
						action: FEEGRANT_ACTION.REVOKE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					recordRevoke.granter = element.payer;
					recordRevoke.type = '';
					records.push(recordRevoke);
					break;
				}
				case FEEGRANT_ACTION.REVOKE: {
					// Normal revoke feegrant
					// Record revoke
					const record = {
						...element,
						status: FEEGRANT_STATUS.REVOKED,
						_id: null,
						action: FEEGRANT_ACTION.REVOKE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					records.push(record);
					break;
				}
				case FEEGRANT_ACTION.REVOKE_WITH_FEEGRANT: {
					// Revoke use feegrant from another
					// Record revoke
					const recordRevoke = {
						...element,
						status: FEEGRANT_STATUS.REVOKED,
						_id: null,
						action: FEEGRANT_ACTION.REVOKE,

						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					records.push(recordRevoke);
					// Record payfee
					const recordPayfee = {
						...element,
						status: FEEGRANT_STATUS.AVAILABLE,
						_id: null,
						action: FEEGRANT_ACTION.USE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					recordPayfee.type = '';
					recordPayfee.grantee = element.granter;
					recordPayfee.granter = element.payer;
					recordPayfee.result = true;
					records.push(recordPayfee);
					break;
				}
				case FEEGRANT_ACTION.CREATE_WITH_FEEGRANT: {
					// Create use feegrant from another
					// Record create
					const recordCreate = {
						...element,
						status: element.result ? FEEGRANT_STATUS.AVAILABLE : FEEGRANT_STATUS.FAIL,
						_id: null,
						action: FEEGRANT_ACTION.CREATE,
						origin_feegrant_txhash: element.tx_hash,
					} as FeegrantEntity;
					recordCreate.amount = element.spend_limit;
					records.push(recordCreate);
					recordsCreate.push(recordCreate);
					// Record pay fee
					const recordPayfee = {
						...element,
						status: FEEGRANT_STATUS.AVAILABLE,
						_id: null,
						action: FEEGRANT_ACTION.USE,
						origin_feegrant_txhash: null,
					} as FeegrantEntity;
					recordPayfee.result = true;
					recordPayfee.type = '';
					recordPayfee.grantee = element.granter;
					recordPayfee.granter = element.payer;
					records.push(recordPayfee);
					break;
				}
			}
		});
		// Insert new grants to feegrant DB
		try {
			await this.broker.call('v1.feegrantDb.insert', {
				entities: recordsCreate,
			});
		} catch (error) {
			this.logger.error(error);
		}
		// Save to history feegrant DB
		try {
			await this.adapter.insertMany(records);
		} catch (error) {
			this.logger.error(error);
		}
		return [];
	}

	public async _start() {
		this.getQueue('feegrant.history-db').on('completed', (job: Job) => {
			this.logger.debug(`Job #${job.id} completed!. Result:`, job.returnvalue);
		});
		this.getQueue('feegrant.history-db').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!. Result:`, job.stacktrace);
		});
		this.getQueue('feegrant.history-db').on('progress', (job: Job) => {
			this.logger.debug(`Job #${job.id} progress is ${job.progress()}%`);
		});
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
