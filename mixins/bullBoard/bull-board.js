'use strict';

const Queue = require('bull');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { QueueConfig, queues } = require('../../config/queue');
const { Config } = require('../../common');

module.exports = {
  started() {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath(`/admin/queues/${Config.REDIS_DB_NUMBER}`);
    const {
      addQueue, removeQueue, setQueues, replaceQueues
    } = createBullBoard({
      queues: [],
      serverAdapter: serverAdapter
    });
    
    this.addRoute({
      path: `/admin/queues/${Config.REDIS_DB_NUMBER}`,
      use: [serverAdapter.getRouter()]
    });
    let listQueues = queues.map(queue_name => {
      return new BullAdapter(Queue(queue_name, QueueConfig.redis, QueueConfig.opts));
    });
    setQueues(listQueues);
  }

};