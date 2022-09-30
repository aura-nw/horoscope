'use strict';

const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const queueConfig = require('@config/queue').QueueConfig;

module.exports = {
  actions: {
    add_queue: {
      params: {
        queue_name: 'string|min:1'
      },
      async handler(ctx) {
        const newQueue = Queue(ctx.params.queue_name, queueConfig.url, queueConfig.opts);
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