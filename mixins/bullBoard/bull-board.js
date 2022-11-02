'use strict';

const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { QueueConfig, queues } = require('../../config/queue');
const { Config } = require('../../common');
const { LIST_NETWORK } = require('../../common/constant');

module.exports = {
  started() {
    LIST_NETWORK.map((e) => {
      const serverAdapter = new ExpressAdapter();
      serverAdapter.setBasePath(`/admin/queues/${e.chainId}`);
      const {
        addQueue, removeQueue, setQueues, replaceQueues
      } = createBullBoard({
        queues: [],
        serverAdapter: serverAdapter
      });

      this.addRoute({
        path: `/admin/queues/${e.chainId}`,
        use: [serverAdapter.getRouter()]
      });
      let listQueues = queues.map(queue_name => {
        return new BullAdapter(Queue(
          queue_name,
          `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${e.redisDbNumber}`,
          {
            prefix: `horoscope-${e.chainId}`,
          }
        ));
      });
      setQueues(listQueues);
    });
  }

};