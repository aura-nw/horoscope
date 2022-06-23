/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
const QueueService = require('moleculer-bull');
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { dbInflationMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { JsonConvert, OperationMode } from 'json2typescript';
import { InflationEntity, ParamEntity } from '../../entities';
import { MintInflationResponseFromApi, ProposalResponseFromApi } from 'types';
export default class CrawlInflationService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbInflationMixin = dbInflationMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlinflation',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.inflation',
					},
				),
				this.callApiMixin,
				this.dbInflationMixin,
			],
			queues: {
				'crawl.inflation': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}
	async handleJob(param: any) {
		let resultCallApi: MintInflationResponseFromApi = await this.callApi(
			URL_TYPE_CONSTANTS.LCD,
			param.url,
		);

		this.logger.debug(`result: ${JSON.stringify(resultCallApi)}`);
		let foundInflation = await this.adapter.findOne({
			'custom_info.chain_id': Config.CHAIN_ID,
		});
		if (foundInflation) {
			foundInflation.inflation = resultCallApi.inflation;
			await this.adapter.updateById(foundInflation._id, foundInflation);
		} else {
			let jsonConvert = new JsonConvert();
			jsonConvert.operationMode = OperationMode.LOGGING;

			const item: InflationEntity = jsonConvert.deserializeObject(
				resultCallApi,
				InflationEntity,
			);
			await this.adapter.insert(item);
		}
		// listProposal.map(async (proposal) => {
		// 	let foundProposal = await this.adapter.findOne({
		// 		proposal_id: `${proposal.proposal_id}`,
		// 	});
		// 	// this.broker.emit('proposal.upsert', { id: proposal.proposal_id });
		// 	if (proposal.status === PROPOSAL_STATUS.PROPOSAL_STATUS_VOTING_PERIOD) {
		// 		this.broker.emit('proposal.upsert', { id: proposal.proposal_id });
		// 	}
		// 	try {
		// 		if (foundProposal) {
		// 			proposal._id = foundProposal._id;
		// 			await this.adapter.updateById(foundProposal._id, proposal);
		// 		} else {
		// 			const item: any = new JsonConvert().deserializeObject(proposal, ProposalEntity);
		// 			await this.adapter.insert(item);
		// 		}
		// 	} catch (error) {
		// 		this.logger.error(error);
		// 	}
		// });
	}

	async _start() {
		this.createJob(
			'crawl.inflation',
			{
				url: `${Config.GET_INFLATION}`,
			},
			{
				removeOnComplete: true,
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_INFLATION, 10),
				},
			},
		);

		this.getQueue('crawl.inflation').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.inflation').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.inflation').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
}
