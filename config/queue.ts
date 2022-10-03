'use strict';

import { Config } from '../common';

const QueueConfig = {
    redis: `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
    opts: {
        prefix: 'horoscope',
    }
}

export default QueueConfig;