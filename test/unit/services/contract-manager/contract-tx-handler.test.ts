'use strict';

import { ServiceBroker } from 'moleculer';
import { Config } from '../../../../common';
import CrawlSmartContractsService from '../../../../services/contract-manager/contract-tx-handler.service';
import { txInstantiateContract, txExecuteContractCreateMinter, txExecuteContractMint, instantiatedContract, createMinterExecuteContractOne, createMinterExecuteContractTwo, mintContract } from './mock-data';
import _ from 'lodash';

Config.TEST = true;

describe('Test contract-tx-handler service', () => {
    jest.setTimeout(40000);

    const broker = new ServiceBroker({ logger: false });
    const smartContractService = broker.createService(CrawlSmartContractsService);

    // Start the broker. It will also init the service
    beforeAll(async () => {
        await broker.start();
        await smartContractService.getQueue('contract.tx-handle').empty();
    });
    // Gracefully stop the broker after all tests
    afterAll(async () => {
        await smartContractService.adapter.removeMany({});
        await broker.stop();
    });

    it('Should crawl new instantiated contract', async () => {
        await smartContractService._handleJob([txInstantiateContract], Config.CHAIN_ID);

        const result = await smartContractService.adapter.findOne({
            contract_address: 'aura1vjka887dy2uq37hpewcxkzulytq7cjthc4643kgm5elzgngl05jqrvr3fp'
        });

        expect(_.omit(result.toObject(), ['_id', '__v'])).toEqual(instantiatedContract);
    });

    it('Should crawl new create_minter execute contract', async () => {
        await smartContractService._handleJob([txExecuteContractCreateMinter], Config.CHAIN_ID);

        const resultOne = await smartContractService.adapter.findOne({
            contract_address: 'aura1efrukzal8ld4e2mqw0hhyajrv0uw74nasue3zn60xzcj2pdhwmfqxsndsl'
        });
        const resultTwo = await smartContractService.adapter.findOne({
            contract_address: 'aura1xl4vsq82heafg99mgatcaeg6eete2umdzvnfq56fh2zlkk7wud6qlstsr4'
        });

        expect(_.omit(resultOne.toObject(), ['_id', '__v'])).toEqual(createMinterExecuteContractOne);
        expect(_.omit(resultTwo.toObject(), ['_id', '__v'])).toEqual(createMinterExecuteContractTwo);
    });

    it('Should update contract data', async () => {
        await smartContractService.adapter.insert(mintContract);
        await smartContractService._handleJob([txExecuteContractMint], Config.CHAIN_ID);

        const result = await smartContractService.adapter.findOne({
            contract_address: 'aura1t7sv20kw5vm8gkpzrak4qfmxxsktdc9ykdjay5kr5lr8frtskwwqdnd6re'
        });

        expect(result.num_tokens).not.toBeNull();
        expect(result.contract_info).not.toBeNull();
    });
});