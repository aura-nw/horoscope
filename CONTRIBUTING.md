# Contributing

## Add new network

-   Add network information to network.json file

## Development Procedure

-   Fork the repo and clone it to your local machine, use branch MAIN
-   Create your service in the service folder using [Moleculerjs](https://moleculer.services/) framework
-   Make some commit, submit PR to MAIN branch

## Start to create your service

There are 3 steps to crawl data from network and save to database:

-   Call api, parse result from LCD, RPC to object
-   Handle business logic
-   Save object to database

For faster coding, we recommend to use [Telescope](https://github.com/osmosis-labs/telescope) to generate interface to parse entity return from LCD or RPC. Osmosis has [Osmojs](https://github.com/osmosis-labs/osmojs) that was generated from Telescope.

### 1. Parse result from LCD, RPC

This is an example to use Osmojs when crawl proposal:

```js
import { QueryProposalsResponseSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/query';
import { ProposalSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/gov';

async crawlProposal(path: String) {
    let listProposal: ProposalSDKType[] = [];

    let param = path;

    let resultCallApi: QueryProposalsResponseSDKType;

    let done = false;
    const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.LCD);

    while (!done) {
        resultCallApi = await this.callApiFromDomain(url, param);
        listProposal.push(...resultCallApi.proposals);
        let key = resultCallApi.pagination?.next_key;
        if (resultCallApi?.pagination?.next_key === null) {
            done = true;
        } else {
            if (key) {
                let text = Buffer.from(key).toString();
                param = `${path}&pagination.key=${encodeURIComponent(text)}`;
            }
        }
    }

    this.logger.info('list proposal is: ', listProposal.length);
}
```

### 2. Save object to database

If you want create new table in database to save object, just use Osmojs to create database model. If you want to save object to existed table, you must define a mapper to map from Osmojs to our existed model.

Mapping example from proposal in Osmojs to current proposal model:

```js
import { ProposalEntity } from 'entities';
import { ProposalSDKType } from 'osmojs/types/codegen/cosmos/gov/v1beta1/gov';
import { AutoMapperUtil } from '../utils/auto-mapper';
export const MAPPER_CONFIG = {
	PROPOSAL_MAPPING: AutoMapperUtil.createMap()
		.mapProperties((t: ProposalEntity) => [
			t.content,
			t.deposit_end_time,
			t.final_tally_result,
			t.proposal_id,
			t.submit_time,
			t.deposit_end_time,
			t.status,
			t.total_deposit,
			t.voting_start_time,
			t.voting_end_time,
		])
		.fromProperties((f: ProposalSDKType) => [
			f.content,
			f.deposit_end_time,
			f.final_tally_result,
			f.proposal_id,
			f.submit_time,
			f.deposit_end_time,
			f.status,
			f.total_deposit,
			f.voting_start_time,
			f.voting_end_time,
		]),
};
```

Save object to current existed model:

```js
async saveToDB(proposal: ProposalSDKType){
    const proposalSaveToDB = AutoMapperUtil.mapEntity(
        MAPPER_CONFIG.PROPOSAL_MAPPING,
        new ProposalEntity(),
        proposal,
    );
    return await this.adapter.insert(proposalSaveToDB);
}
```
