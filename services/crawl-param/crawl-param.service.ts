/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import createBullService from '../../mixins/customMoleculerBull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { dbParamMixin } from '../../mixins/dbMixinMongoose';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import QueueConfig from '../../config/queue';

export default class CrawlParamService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbParamMixin = dbParamMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlparam',
			version: 1,
			mixins: [
				createBullService(QueueConfig.redis, QueueConfig.opts),
				this.callApiMixin,
				this.dbParamMixin,
			],
			queues: {
				'crawl.param': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.handleJob(job.data.param);
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob() {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		let [
			paramBank,
			paramDistribution,
			paramGovVoting,
			paramGovTallying,
			paramGovDeposit,
			paramSlashing,
			paramStaking,
			paramIBCTransfer,
			paramMint,
		] = await Promise.all([
			this.callApiFromDomain(url, Config.GET_PARAMS_BANK),
			this.callApiFromDomain(url, Config.GET_PARAMS_DISTRIBUTION),
			this.callApiFromDomain(url, Config.GET_PARAMS_GOV_VOTING),
			this.callApiFromDomain(url, Config.GET_PARAMS_GOV_TALLYING),
			this.callApiFromDomain(url, Config.GET_PARAMS_GOV_DEPOSIT),
			this.callApiFromDomain(url, Config.GET_PARAMS_SLASHING),
			this.callApiFromDomain(url, Config.GET_PARAMS_STAKING),
			this.callApiFromDomain(url, Config.GET_PARAMS_IBC_TRANSFER),
			this.callApiFromDomain(url, Config.GET_PARAMS_MINT),
		]);

		this.logger.debug(`paramBank: ${JSON.stringify(paramBank)}`);
		this.logger.debug(`paramDistribution: ${JSON.stringify(paramDistribution)}`);
		this.logger.debug(`paramSlashing: ${JSON.stringify(paramSlashing)}`);
		this.logger.debug(`paramStaking: ${JSON.stringify(paramStaking)}`);
		this.logger.debug(`paramApiTransfer: ${JSON.stringify(paramIBCTransfer)}`);
		this.logger.debug(`paramMint: ${JSON.stringify(paramMint)}`);

		let paramGov = {
			type: 'gov',
			params: {
				voting_param: paramGovVoting.voting_params,
				tallying_param: paramGovTallying.tally_params,
				deposit_param: paramGovDeposit.deposit_params,
			},
		};
		this.logger.debug(`paramGov: ${JSON.stringify(paramGov)}`);

		let listParamInDb = await this.adapter.find({
			query: {
				module: {
					$in: [
						'bank',
						'distribution',
						'gov',
						'slashing',
						'staking',
						'ibc-transfer',
						'mint',
					],
				},
				'custom_info.chain_id': Config.CHAIN_ID,
			},
		});

		this.logger.debug(`listParamInDb: ${listParamInDb}`);
		let id = await Promise.all([
			this.findAndUpdate(listParamInDb, 'bank', paramBank.params),
			this.findAndUpdate(listParamInDb, 'distribution', paramDistribution.params),
			this.findAndUpdate(listParamInDb, 'gov', paramGov.params),
			this.findAndUpdate(listParamInDb, 'slashing', paramSlashing.params),
			this.findAndUpdate(listParamInDb, 'staking', paramStaking.params),
			this.findAndUpdate(listParamInDb, 'ibc-transfer', paramIBCTransfer.params),
			this.findAndUpdate(listParamInDb, 'mint', paramMint.params),
		]);
		this.logger.debug(`id: ${JSON.stringify(id)}`);
	}

	async findAndUpdate(listParamInDb: any, module: String, params: any) {
		if (listParamInDb.length > 0) {
			let item = listParamInDb.find((item: any) => item._doc.module == module);
			this.logger.debug(`item: ${item}`);
			if (item) {
				await this.adapter.updateById(item._id, { params: params });
			}
		} else {
			// let jsonConvert = new JsonConvert();
			// jsonConvert.operationMode = OperationMode.LOGGING;
			// const item: any = jsonConvert.deserializeObject(
			// 	{ module: module, params: params },
			// 	ParamEntity,
			// );
			// this.logger.info(`item: ${item}`);
			await this.adapter.insert({ _id: null, module: module, params: params });
		}
	}

	async createParamFromApi(type: String, path: String) {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

		return {
			type: type,
			params: (await this.callApiFromDomain(url, path)).params,
		};
	}

	async _start() {
		this.createJob(
			'crawl.param',
			{
				param: `param`,
			},
			{
				removeOnComplete: true,
				removeOnFail: {
					count: 3,
				},
				repeat: {
					every: parseInt(Config.MILISECOND_CRAWL_PARAM, 10),
				},
			},
		);
		this.getQueue('crawl.param').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.param').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.param').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		try {
			await this.broker.waitForServices(['api']);
			await this.broker.call('api.add_queue', { queue_name: 'crawl.param' });
		} catch (error) {
			this.logger.error(error);
		}
		return super._start();
	}
}
