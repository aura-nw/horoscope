'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CodeIdService from '../../../../services/api-service/codeid.service';
import CodeIDManagerService from '../../../../services/code-id-manager/code-id-manager.service';
import { Types } from 'mongoose';
import _ from 'lodash';

Config.TEST = true;

describe('Test codeid api service', () => {
    const broker = new ServiceBroker({ logger: false });
    const codeIdApiService = broker.createService(CodeIdService);

    const codeIdManagerService = broker.createService(CodeIDManagerService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await codeIdManagerService.adapter.insert({
            "_id": new Types.ObjectId(),
            "custom_info": {
                "chain_id": Config.CHAIN_ID,
                "chain_name": "Aura Devnet"
            },
            "contract_type": "CW721",
            "code_id": "181",
            "status": "COMPLETED",
            "createdAt": new Date(),
            "updatedAt": new Date(),
            "__v": 0
        });
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await codeIdManagerService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should return result of code id', async () => {
        const result = await codeIdApiService.checkStatus({
            params: {
                codeId: 181,
                chainId: Config.CHAIN_ID
            }
        });

        expect(result.data).toEqual({
            "contractType": "CW721",
            "status": "COMPLETED",
        });
    });

    it('Should return message not found', async () => {
        const result = await codeIdApiService.checkStatus({
            params: {
                codeId: 19,
                chainId: Config.CHAIN_ID
            }
        });

        expect(result.data).toEqual({
            "contractType": "",
            "status": "NotFound",
        });
    });
});