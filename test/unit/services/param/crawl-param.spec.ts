'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlParamService from '../../../../services/crawl-param/crawl-param.service';
import _ from 'lodash';

Config.TEST = true;

describe('Test crawl-param service', () => {
    jest.setTimeout(30000);

    const broker = new ServiceBroker({ logger: false });
    const paramService = broker.createService(CrawlParamService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await paramService.getQueue('crawl.param').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await paramService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should insert new param', async () => {
        await paramService.handleJob();

        const result = await paramService.adapter.find({});

        expect(result.find((res: any) => res.module === 'bank').params.default_send_enabled).toEqual(true);
        expect(result.find((res: any) => res.module === 'distribution').params.withdraw_addr_enabled).toEqual(true);
        expect(result.find((res: any) => res.module === 'gov').params.voting_param).not.toBeUndefined();
        expect(result.find((res: any) => res.module === 'slashing').params.signed_blocks_window).not.toBeUndefined();
        expect(result.find((res: any) => res.module === 'staking').params.bond_denom).toEqual('utaura');
        expect(result.find((res: any) => res.module === 'ibc-transfer').params.send_enabled).toEqual(true);
        expect(result.find((res: any) => res.module === 'mint').params.mint_denom).toEqual('utaura');
    });

    it('Should update param', async () => {
        const resultOld = await paramService.adapter.find({});

        await paramService.handleJob();

        const resultNew = await paramService.adapter.find({});

        expect(resultOld.find((res: any) => res.module === 'bank').params.default_send_enabled)
            .toEqual(resultNew.find((res: any) => res.module === 'bank').params.default_send_enabled);
        expect(resultOld.find((res: any) => res.module === 'distribution').params.withdraw_addr_enabled)
            .toEqual(resultNew.find((res: any) => res.module === 'distribution').params.withdraw_addr_enabled);
        expect(resultOld.find((res: any) => res.module === 'gov').params.voting_param)
            .toEqual(resultNew.find((res: any) => res.module === 'gov').params.voting_param);
        expect(resultOld.find((res: any) => res.module === 'slashing').params.signed_blocks_window)
            .toEqual(resultNew.find((res: any) => res.module === 'slashing').params.signed_blocks_window);
        expect(resultOld.find((res: any) => res.module === 'staking').params.bond_denom)
            .toEqual(resultNew.find((res: any) => res.module === 'staking').params.bond_denom);
        expect(resultOld.find((res: any) => res.module === 'ibc-transfer').params.send_enabled)
            .toEqual(resultNew.find((res: any) => res.module === 'ibc-transfer').params.send_enabled);
        expect(resultOld.find((res: any) => res.module === 'mint').params.mint_denom)
            .toEqual(resultNew.find((res: any) => res.module === 'mint').params.mint_denom);
    })
});