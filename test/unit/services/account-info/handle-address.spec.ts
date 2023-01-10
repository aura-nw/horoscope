'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import { CONST_CHAR } from '../../../../common/constant';
import HandleAddressService from '../../../../services/crawl-account-info/handle-address.service';
import { accountOne, accountTwo, listTx } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test handle-address service', () => {
    const broker = new ServiceBroker({ logger: false });
    const handleAddressService = broker.createService(HandleAddressService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await handleAddressService.getQueue('handle.address').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await handleAddressService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new account', async () => {
        await handleAddressService.handleJob(listTx, CONST_CHAR.CRAWL, Config.CHAIN_ID);
        let [resultOne, resultTwo] = await Promise.all([
            handleAddressService.adapter.findOne({
                address: 'aura1t0l7tjhqvspw7lnsdr9l5t8fyqpuu3jm57ezqa'
            }),
            handleAddressService.adapter.findOne({
                address: 'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5'
            })
        ]);

        expect(_.omit(resultOne.toObject(), ['_id'])).toEqual(accountOne);
        expect(_.omit(resultTwo.toObject(), ['_id'])).toEqual(accountTwo);
    });

    it('Should throw error when trying to read tx logs', async () => {
        expect(async () => {
            await handleAddressService.handleJob(
                [
                    {
                        tx_response: {
                            logs: [
                                {
                                    msg: {},
                                    index: {}
                                }
                            ]
                        }
                    }
                ],
                CONST_CHAR.CRAWL,
                Config.CHAIN_ID
            )
        }).rejects.toThrow();
    });
});