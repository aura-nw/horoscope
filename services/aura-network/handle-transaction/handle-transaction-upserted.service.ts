/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { ITransaction } from 'entities';
import { Config } from '../../../common';
import { queueConfig } from '../../../config/queue';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const queueService = require('moleculer-bull');

export default class HandleTransactionUpsertedService extends Service {
	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'handle-transaction-upserted',
			version: 1,
			mixins: [queueService(queueConfig.redis, queueConfig.opts)],

			events: {
				'list-tx.upsert': {
					handler: (ctx: any) => {
						this._createJobFromEvent(
							ctx.params.listTx,
							ctx.params.chainId,
							ctx.params.source,
						);
						return;
					},
				},
			},
		});
	}

	private _createJobFromEvent(listTx: ITransaction[], chainId: string, source: string) {
		// Create job handle asset
		if (Config.CREATE_JOB_ASSET_TX_HANDLE === 'true') {
			this.createJob(
				'asset.tx-handle',
				{
					listTx,
					chainId,
					source,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
					},
					attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
					backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
				},
			);
		}

		// Create job handle contract
		if (Config.CREATE_JOB_CONTRACT_TX_HANDLE === 'true') {
			this.createJob(
				'contract.tx-handle',
				{
					listTx,
					chainId,
					source,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
					},
					attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
					backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
				},
			);
		}

		// Create job crawl account information
		if (Config.CREATE_JOB_HANDLE_ADDRESS === 'true') {
			this.createJob(
				'handle.address',
				{
					listTx,
					chainId,
					source,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
					},
					attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
					backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
				},
			);
		}

		// Create job vote handle
		if (Config.CREATE_JOB_PROPOSAL_VOTE === 'true') {
			this.createJob(
				'proposal.vote',
				{
					listTx,
					chainId,
				},
				{
					removeOnComplete: true,
					removeOnFail: {
						count: parseInt(Config.BULL_JOB_REMOVE_ON_FAIL_COUNT, 10),
					},
					attempts: parseInt(Config.BULL_JOB_ATTEMPT, 10),
					backoff: parseInt(Config.BULL_JOB_BACKOFF, 10),
				},
			);
		}
	}

	public async _start() {
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
