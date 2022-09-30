'use strict';

const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Config } = require('../../common');

module.exports = {
  actions: {
    add_queue: {
      params: {
        queue_name: 'string|min:1'
      },
      async handler(ctx) {
        const redisUrl = `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`;
        const newQueue = Queue(
          ctx.params.queue_name, 
          redisUrl, 
          {
						prefix: ctx.params.prefix,
					}
        );
        this.addQueue(new BullAdapter(newQueue));
      }

    }
  },

  started() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');
    const {
      addQueue, removeQueue, setQueues, replaceQueues
    } = createBullBoard({
      queues: [],
      serverAdapter: serverAdapter
    });
    this.addQueue = addQueue;
    this.addRoute({
      path: '/admin/queues',
      use: [serverAdapter.getRouter()]
    });
  }

};