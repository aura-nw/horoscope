/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, ServiceBroker } from 'moleculer';
import QueueService from 'moleculer-bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { dbParamMixin } from '../../mixins/dbMixinMongoose';
export default class CrawlParamService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private dbParamMixin = dbParamMixin;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawlparam',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.param',
					},
				),
				this.callApiMixin,
				dbParamMixin,
			],
			queues: {
				'crawl.param': {
					concurrency: 1,
					async process(job) {
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

	async initEnv() {}
	async handleJob(param) {
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
			// this.createParamFromApi('bank', Config.GET_PARAMS_BANK),
			// this.createParamFromApi('distribution', Config.GET_PARAMS_DISTRIBUTION),
			// this.createParamFromApi('gov1', Config.GET_PARAMS_GOV_VOTING),
			// this.createParamFromApi('gov2', Config.GET_PARAMS_GOV_TALLYING),
			// this.createParamFromApi('gov3', Config.GET_PARAMS_GOV_DEPOSIT),
			// this.createParamFromApi('slashing', Config.GET_PARAMS_SLASHING),
			// this.createParamFromApi('staking', Config.GET_PARAMS_STAKING),
			// this.createParamFromApi('ibc-transfer', Config.GET_PARAMS_IBC_TRANSFER),
			// this.createParamFromApi('mint', Config.GET_PARAMS_MINT),

			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_BANK),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_DISTRIBUTION),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_GOV_VOTING),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_GOV_TALLYING),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_GOV_DEPOSIT),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_SLASHING),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_STAKING),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_IBC_TRANSFER),
			this.callApi(URL_TYPE_CONSTANTS.LCD, Config.GET_PARAMS_MINT),
		]);
		// let item = {
		// 	paramBank: paramBank,
		// 	paramDistribution: paramDistribution,
		// 	paramGovVoting: paramGovVoting,
		// 	paramGovTallying: paramGovTallying,
		// 	paramGovDeposit: paramGovDeposit,
		// 	paramSlashing: paramSlashing,
		// 	paramStaking: paramStaking,
		// 	paramIBCTransfer: paramIBCTransfer,
		// 	paramMint: paramMint,
		// };
		// this.logger.info(`param: ${JSON.stringify(item)}`);
		// await this.dbParamMixin.save(item);
		this.logger.info(`paramBank: ${JSON.stringify(paramBank)}`);
		this.logger.info(`paramDistribution: ${JSON.stringify(paramDistribution)}`);
		// this.logger.info(`paramGovVoting: ${JSON.stringify(paramGovVoting)}`);
		// this.logger.info(`paramGovTallying: ${JSON.stringify(paramGovTallying)}`);
		// this.logger.info(`paramGovDeposit: ${JSON.stringify(paramGovDeposit)}`);
		this.logger.info(`paramSlashing: ${JSON.stringify(paramSlashing)}`);
		this.logger.info(`paramStaking: ${JSON.stringify(paramStaking)}`);
		this.logger.info(`paramApiTransfer: ${JSON.stringify(paramIBCTransfer)}`);
		this.logger.info(`paramMint: ${JSON.stringify(paramMint)}`);

		let paramGov = {
			type: 'gov',
			params: {
				voting_param: paramGovVoting.voting_params,
				tallying_param: paramGovTallying.tallying_params,
				deposit_param: paramGovDeposit.deposit_params,
			},
		};

		let listParamInDb = await this.adapter.find({
			module: ['bank', 'distribution', 'gov', 'slashing', 'staking', 'ibc-transfer', 'mint'],
		});

		// listParamInDb.map((item) => {});

		this.logger.info(`listParamInDb: ${listParamInDb}`);

		this.logger.info(`paramGov: ${JSON.stringify(paramGov)}`);

		// await this.adapter.insert({ module: 'bank', params: paramBank.params });

		let id = await Promise.all([
			this.findAndUpdate(listParamInDb, 'bank', paramBank.params),
			this.findAndUpdate(listParamInDb, 'distribution', paramDistribution.params),
			this.findAndUpdate(listParamInDb, 'gov', paramGov.params),
			this.findAndUpdate(listParamInDb, 'slashing', paramSlashing.params),
			this.findAndUpdate(listParamInDb, 'staking', paramStaking.params),
			this.findAndUpdate(listParamInDb, 'ibc-transfer', paramIBCTransfer.params),
			this.findAndUpdate(listParamInDb, 'mint', paramMint.params),
		]);
		this.logger.info(`id: ${JSON.stringify(id)}`);
		// await this.adapter.insertMany([
		// 	{ module: 'bank', params: paramBank.params },
		// 	{ module: 'distribution', params: paramDistribution.params },
		// 	{ module: 'gov', params: paramGov },
		// 	{ module: 'slashing', params: paramSlashing.params },
		// 	{ module: 'staking', params: paramStaking.params },
		// 	{ module: 'ibc-transfer', params: paramIBCTransfer.params },
		// 	{ module: 'mint', params: paramMint.params },
		// ]);

		// let modelBank = {
		// 	type: 'bank',
		// 	param: paramBank.params,
		// };
	}

	async findAndUpdate(listParamInDb, module, params) {
		if (listParamInDb.length > 0) {
			let item = listParamInDb.find((item) => item._doc.module == module);
			this.logger.info(`item: ${item}`);
			if (item) {
				await this.adapter.updateById(item._id, { params: params });
			}
		} else {
			await this.adapter.insert({ module: module, params: params });
		}
	}

	async createParamFromApi(type: String, url: String) {
		return {
			type: type,
			params: (await this.callApi(URL_TYPE_CONSTANTS.LCD, url)).params,
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
				repeat: {
					every: 5000,
				},
			},
		);
		this.getQueue('crawl.param').on('completed', (job, res) => {
			this.logger.info(`Job #${JSON.stringify(job)} completed!. Result:`, res);
			// this.getStatistic();
			// job.remove();
		});
		this.getQueue('crawl.param').on('failed', (job, err) => {
			this.logger.error(`Job #${JSON.stringify(job)} failed!. Result:`, err);
			// this.getStatistic();
			// job.remove();
		});
		this.getQueue('crawl.param').on('progress', (job, progress) => {
			this.logger.info(`Job #${JSON.stringify(job)} progress is ${progress}%`);
		});
		return super._start();
	}
}
