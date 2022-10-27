'use strict';

process.env.TEST = 'true';

import { Context, Errors, ServiceBroker } from 'moleculer';
import FeegrantTxHandler from '../../../../services/feegrant-indexer/feegrant-tx-handler.service';

describe("Test 'products' service", () => {
    describe('Test actions', () => {
        const broker = new ServiceBroker({ logger: false });
        const service = broker.createService(FeegrantTxHandler);

        jest.spyOn(service.adapter, 'updateById');
        jest.spyOn(service, 'transformDocuments');
        jest.spyOn(service, 'entityChanged');

        beforeAll(() => broker.start());
        afterAll(() => broker.stop());

        const record = {
            _id: '123',
            name: 'Awesome thing',
            price: 999,
            quantity: 25,
            createdAt: Date.now(),
        };

        describe("Test 'v1.products.increaseQuantity'", () => {
            it('should call the adapter updateById method & transform result', async () => {
                service.adapter.updateById.mockImplementation(async () => record);
                service.transformDocuments.mockClear();
                service.entityChanged.mockClear();

                const res = await broker.call('v1.products.increaseQuantity', {
                    id: '123',
                    value: 10,
                });
                expect(res).toEqual({
                    _id: '123',
                    name: 'Awesome thing',
                    price: 999,
                    quantity: 25,
                });

                expect(service.adapter.updateById).toBeCalledTimes(1);
                expect(service.adapter.updateById).toBeCalledWith('123', {
                    $inc: { quantity: 10 },
                });

                expect(service.transformDocuments).toBeCalledTimes(1);
                expect(service.transformDocuments).toBeCalledWith(
                    expect.any(Context),
                    { id: '123', value: 10 },
                    record,
                );

                expect(service.entityChanged).toBeCalledTimes(1);
                expect(service.entityChanged).toBeCalledWith(
                    'updated',
                    { _id: '123', name: 'Awesome thing', price: 999, quantity: 25 },
                    expect.any(Context),
                );
            });
        });
    });

});
