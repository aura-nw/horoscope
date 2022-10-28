'use strict';

process.env.TEST = 'true';

import { Context, Errors, ServiceBroker } from 'moleculer';
import FeegrantTxHandler from '../../../../services/feegrant-indexer/feegrant-tx-handler.service';

describe("Test 'products' service", () => {
    describe('Test actions', () => {
        const broker = new ServiceBroker({ logger: false });
        const service = broker.createService(FeegrantTxHandler);


        beforeAll(() => broker.start());
        afterAll(() => broker.stop());

    });

});
