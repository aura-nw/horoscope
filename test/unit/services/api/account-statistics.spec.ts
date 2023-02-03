'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import AccountStatisticsService from '../../../../services/api-service/account-statistics.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test account-statistics api service', () => {
	jest.setTimeout(30000);

	const broker = new ServiceBroker({ logger: false });
	const accountStatisticsApiService = broker.createService(AccountStatisticsService);

	// Start the broker. It will also init the service
	beforeAll(async () => {
		await broker.start();
		await accountStatisticsApiService.adapter.insert({
			_id: new Types.ObjectId(),
			one_day: {
				total_sent_tx: {
					amount: 1101,
					percentage: 99.4579945799458,
				},
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
				total_sent_amount: {
					amount: 2202000000,
					percentage: 99.17797537675706,
				},
				total_received_amount: {
					amount: 0,
					percentage: 0,
				},
			},
			three_days: {
				total_sent_tx: {
					amount: 3440,
					percentage: 98.53910054425666,
				},
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
				total_sent_amount: {
					amount: 6880000000,
					percentage: 53.18294713041792,
				},
				total_received_amount: {
					amount: 6880000000,
					percentage: 52.70615658646266,
				},
			},
			seven_days: {
				total_sent_tx: {
					amount: 7682,
					percentage: 98.89289392378991,
				},
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
				total_sent_amount: {
					amount: 15364000000,
					percentage: 55.95646230603016,
				},
				total_received_amount: {
					amount: 15364000000,
					percentage: 52.0381554255338,
				},
			},
			custom_info: {
				chain_id: Config.CHAIN_ID,
				chain_name: 'Aura Devnet',
			},
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			per_day: [
				{
					total_sent_tx: {
						amount: 1591,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 3182000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 1053,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 2106000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 1053,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 2106000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 545,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 1090000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 545,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 1090000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 1794,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 3588000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
				{
					total_sent_tx: {
						amount: 1101,
						percentage: 0,
					},
					total_received_tx: {
						amount: 0,
						percentage: 0,
					},
					total_sent_amount: {
						amount: 2202000000,
						percentage: 0,
					},
					total_received_amount: {
						amount: 0,
						percentage: 0,
					},
				},
			],
			__v: 0,
		});
	});
	// Gracefully stop the broker after all tests
	afterAll(async () => {
		await accountStatisticsApiService.adapter.removeMany({});
		await broker.stop();
	});

	it('Should return account statistics case one_day', async () => {
		const result: any = await broker.call('v1.account-statistics.getTopAccounts', {
			chainId: Config.CHAIN_ID,
			dayRange: 1,
			limit: 1,
		});

		expect(_.omit(result.data.top_txn_count_sent[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_tx: {
					amount: 1101,
					percentage: 99.4579945799458,
				},
			},
		});
		expect(_.omit(result.data.top_txn_count_received[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
			},
		});
		expect(_.omit(result.data.top_aura_senders[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_amount: {
					amount: 2202000000,
					percentage: 99.17797537675706,
				},
			},
		});
		expect(_.omit(result.data.top_aura_receivers[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_amount: {
					amount: 0,
					percentage: 0,
				},
			},
		});
	});

	it('Should return account statistics case three_days', async () => {
		const result: any = await broker.call('v1.account-statistics.getTopAccounts', {
			chainId: Config.CHAIN_ID,
			dayRange: 3,
			limit: 1,
		});

		expect(_.omit(result.data.top_txn_count_sent[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_tx: {
					amount: 3440,
					percentage: 98.53910054425666,
				},
			},
		});
		expect(_.omit(result.data.top_txn_count_received[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
			},
		});
		expect(_.omit(result.data.top_aura_senders[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_amount: {
					amount: 6880000000,
					percentage: 53.18294713041792,
				},
			},
		});
		expect(_.omit(result.data.top_aura_receivers[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_amount: {
					amount: 6880000000,
					percentage: 52.70615658646266,
				},
			},
		});
	});

	it('Should return account statistics case seven_days', async () => {
		const result: any = await broker.call('v1.account-statistics.getTopAccounts', {
			chainId: Config.CHAIN_ID,
			dayRange: 7,
			limit: 1,
		});

		expect(_.omit(result.data.top_txn_count_sent[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_tx: {
					amount: 7682,
					percentage: 98.89289392378991,
				},
			},
		});
		expect(_.omit(result.data.top_txn_count_received[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_tx: {
					amount: 0,
					percentage: 0,
				},
			},
		});
		expect(_.omit(result.data.top_aura_senders[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_sent_amount: {
					amount: 15364000000,
					percentage: 55.95646230603016,
				},
			},
		});
		expect(_.omit(result.data.top_aura_receivers[0], ['_id'])).toEqual({
			address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa',
			result: {
				total_received_amount: {
					amount: 15364000000,
					percentage: 52.0381554255338,
				},
			},
		});
	});
});
