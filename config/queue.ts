'use strict';

import { Config } from '../common';

export const QueueConfig = {
    redis: `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
    opts: {
        prefix: 'horoscope',
    }
}
export const queues = [
    'asset.tx-handle',
    'crawl.account-auth-info',
    'crawl.account-balances',
    'crawl.account-claimed-rewards',
    'crawl.account-delegates',
    'crawl.account-redelegates',
    'crawl.account-spendable-balances',
    'crawl.account-unbonds',
    'handle.account-continuous-vesting',
    'handle.address',
    'handle.delay-job',
    'crawl.supply',
    'crawl.block',
    'crawl.community-pool',
    'crawl.inflation',
    'crawl.param',
    'crawl.deposit.proposal',
    'crawl.proposal',
    'crawl.tally.proposal',
    'crawl.signinginfo',
    'crawl.pool',
    'crawl.staking.validator',
    'crawl.daily-tx',
    'crawl.account-stats',
    'crawl.transaction',
    'add-proposer',
    'handle.block',
    'handle.transaction.delegate',
    'handle.transaction',
    'listblock.insert',
    'listtx.insert',
    'proposal.vote',
    'websocket.tx-handle',
    'websocket.safe-tx-handle'
];