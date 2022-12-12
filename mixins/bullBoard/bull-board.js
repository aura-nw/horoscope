'use strict';

import { createBullBoard } from '@bull-board/api';
import Queue from 'bull';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { queues } from '../../config/queue';
import { Config } from '../../common';
import { LIST_NETWORK } from '../../common/constant';

module.exports = {
	started() {
		LIST_NETWORK.filter((e) => e.redisDbNumber).map((e) => {
			const serverAdapter = new ExpressAdapter();
			serverAdapter.setBasePath(`/admin/queues/${e.chainId}`);
			const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
				queues: [],
				serverAdapter,
			});

			this.addRoute({
				path: `/admin/queues/${e.chainId}`,
				use: [serverAdapter.getRouter()],
			});
			const listQueues = queues.map(
				(queueName) =>
					new BullAdapter(
						Queue(
							queueName,
							`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${e.redisDbNumber}`,
							{
								prefix: `horoscope-${e.chainId}`,
							},
						),
					),
			);
			setQueues(listQueues);
		});
	},
};
