'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CodeIDService from '../../../../services/code-id-manager/code-id-manager.service';
import _ from 'lodash';
import { codeId } from './mock-data';

Config.TEST = true;

describe('Test code-id-manager service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const codeIDService = broker.createService(CodeIDService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await codeIDService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return code id status', async () => {
        await codeIDService.actInsert({ params: { ...codeId } });

        const [resultExist, resultNull] = await Promise.all([
            codeIDService.checkStatus({ params: { chain_id: Config.CHAIN_ID, code_id: 176 } }),
            codeIDService.checkStatus({ params: { chain_id: Config.CHAIN_ID, code_id: 190 } }),
        ]);

        expect(resultExist).toEqual({ status: codeId.status, contractType: codeId.contract_type });
        expect(resultNull).toEqual({ status: 'NotFound', contractType: '' });
    });

    it('Should insert new record and found the record', async () => {
        const result = await codeIDService.actFind({
            params: { query: { code_id: codeId.code_id, 'custom_info.chain_id': Config.CHAIN_ID } },
        });

        await codeIDService.actUpdateMany({
            params: {
                condition: {
                    custom_info: codeId.custom_info,
                    _id: result[0]._id
                },
                update: {
                    status: 'COMPLETED'
                }
            }
        });
        const updateResult = await codeIDService.actFind({
            params: { query: { code_id: codeId.code_id, 'custom_info.chain_id': Config.CHAIN_ID } },
        });

        expect(_.omit(result[0].toObject(), ['_id', '__v'])).toEqual(_.omit(codeId, ['_id']));
        expect(updateResult[0].status).toEqual('COMPLETED');
    });
});