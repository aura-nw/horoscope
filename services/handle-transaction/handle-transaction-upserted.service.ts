/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Service, ServiceBroker } from 'moleculer';
import { ITransaction } from 'entities';
import { queueConfig } from '../../config/queue';
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
					count: 10,
				},
			},
		);

		// Create job handle contract
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
					count: 10,
				},
			},
		);

		// Create job crawl account information
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
					count: 10,
				},
			},
		);

		// Create job vote handle
		this.createJob(
			'proposal.vote',
			{
				listTx,
				chainId,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 10,
				},
			},
		);
	}

	public async _start() {
		await this.broker.waitForServices(['v1.handle-transaction']);
		// eslint-disable-next-line no-underscore-dangle
		return super._start();
	}
}
