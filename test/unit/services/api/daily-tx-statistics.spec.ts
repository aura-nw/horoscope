'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import DailyTxStatisticsService from '../../../../services/api-service/daily-tx-statistics.service';
import { Types } from 'mongoose';
import _ from 'lodash';
import { BLOCKCHAIN_DATA } from '../../../../common/constant';

Config.TEST = true;

describe('Test daily-tx-statistics api service', () => {
	const broker = new ServiceBroker({ logger: false });
	const dailyTxStatisticsApiService = broker.createService(DailyTxStatisticsService);

	const date = new Date();
	const endTime = date.setUTCHours(0, 0, 0, 0);
	date.setDate(date.getDate() - 1);
	const startTime = date.setUTCHours(0, 0, 0, 0);

	// Start the broker. It will also init the service
	beforeAll(async () => {
		await broker.start();
		await dailyTxStatisticsApiService.adapter.insertMany([
			{
				_id: new Types.ObjectId(),
				custom_info: {
					chain_id: Config.CHAIN_ID,
					chain_name: 'Aura Devnet',
				},
				daily_txs: 106,
				daily_active_addresses: 64,
				unique_addresses: 178339,
				unique_addresses_increase: 27,
				date: endTime,
				__v: 0,
			},
			{
				_id: new Types.ObjectId(),
				custom_info: {
					chain_id: Config.CHAIN_ID,
					chain_name: 'Aura Devnet',
				},
				daily_txs: 523,
				daily_active_addresses: 112,
				unique_addresses: 178348,
				unique_addresses_increase: 9,
				date: startTime,
				__v: 0,
			},
		]);
	});
	// Gracefully stop the broker after all tests
	afterAll(async () => {
		await dailyTxStatisticsApiService.adapter.removeMany({});
		await broker.stop();
	});

	it('Should return daily tx stats case no property chosen', async () => {
		const result: any = await broker.call('v1.daily-tx-statistics.getDailyData', {
			chainId: Config.CHAIN_ID,
			startDate: startTime,
		});

		expect(_.omit(result.data.dailyData[0], ['_id', 'date'])).toEqual({
			custom_info: {
				chain_id: Config.CHAIN_ID,
				chain_name: 'Aura Devnet',
			},
			daily_txs: 523,
			daily_active_addresses: 112,
			unique_addresses: 178348,
			unique_addresses_increase: 9,
			__v: 0,
		});
		expect(_.omit(result.data.dailyData[1], ['_id', 'date'])).toEqual({
			custom_info: {
				chain_id: Config.CHAIN_ID,
				chain_name: 'Aura Devnet',
			},
			daily_txs: 106,
			daily_active_addresses: 64,
			unique_addresses: 178339,
			unique_addresses_increase: 27,
			__v: 0,
		});
		expect(result.data.extremeData).toEqual({
			// daily_txs: {
			// 	max: {
			// 		amount: 523,
			// 		date: new Date(startTime),
			// 	},
			// 	min: {
			// 		amount: 106,
			// 		date: new Date(endTime),
			// 	},
			// },
			// unique_addresses: {
			// 	max_gap: {
			// 		amount: 27,
			// 		date: new Date(endTime),
			// 	},
			// 	min_gap: {
			// 		amount: 9,
			// 		date: new Date(startTime),
			// 	},
			// },
		});
	});

	it('Should return daily tx stats case daily_txs property chosen', async () => {
		const result: any = await broker.call('v1.daily-tx-statistics.getDailyData', {
			chainId: Config.CHAIN_ID,
			property: BLOCKCHAIN_DATA.DAILY_TXS,
			startDate: startTime,
		});

		expect(_.omit(result.data.dailyData[0], ['_id', 'date'])).toEqual({
			daily_txs: 523,
		});
		expect(_.omit(result.data.dailyData[1], ['_id', 'date'])).toEqual({
			daily_txs: 106,
		});
		expect(result.data.extremeData).toEqual({
			max: {
				amount: 523,
				date: new Date(startTime),
			},
			min: {
				amount: 106,
				date: new Date(endTime),
			},
		});
	});

	it('Should return daily tx stats case daily_active_addresses property chosen', async () => {
		const result: any = await broker.call('v1.daily-tx-statistics.getDailyData', {
			chainId: Config.CHAIN_ID,
			property: BLOCKCHAIN_DATA.DAILY_ACTIVE_ADDRESSES,
			startDate: startTime,
		});

		expect(_.omit(result.data.dailyData[0], ['_id', 'date'])).toEqual({
			daily_active_addresses: 112,
		});
		expect(_.omit(result.data.dailyData[1], ['_id', 'date'])).toEqual({
			daily_active_addresses: 64,
		});
		expect(result.data.extremeData).toEqual({
			max: {
				amount: 112,
				date: new Date(startTime),
			},
			min: {
				amount: 64,
				date: new Date(endTime),
			},
		});
	});
	it('Should return daily tx stats case unique_addresses property chosen', async () => {
		const result: any = await broker.call('v1.daily-tx-statistics.getDailyData', {
			chainId: Config.CHAIN_ID,
			property: BLOCKCHAIN_DATA.UNIQUE_ADDRESSES,
			startDate: startTime,
		});

		expect(_.omit(result.data.dailyData[0], ['_id', 'date'])).toEqual({
			unique_addresses: 178348,
			unique_addresses_increase: 9,
		});
		expect(_.omit(result.data.dailyData[1], ['_id', 'date'])).toEqual({
			unique_addresses: 178339,
			unique_addresses_increase: 27,
		});
		expect(result.data.extremeData).toEqual({
			max: {
				amount: 27,
				date: new Date(endTime),
			},
			min: {
				amount: 9,
				date: new Date(startTime),
			},
		});
	});
});
