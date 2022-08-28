/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';
import { Config } from '../../common';
import { Service, Context, ServiceBroker } from 'moleculer';

const QueueService = require('moleculer-bull');
// import createService from 'moleculer-bull';
import CallApiMixin from '../../mixins/callApi/call-api.mixin';
import RedisMixin from '../../mixins/redis/redis.mixin';
import { RedisClientType } from '@redis/client';
import { URL_TYPE_CONSTANTS } from '../../common/constant';
import { Job } from 'bull';
import { Utils } from '../../utils/utils';
import { BlockResponseFromLCD, ResponseFromRPC } from '../../types';
import { IBlock } from 'entities';
import { toBase64, toUtf8 } from '@cosmjs/encoding';
import { dbTransactionMixin } from '../../mixins/dbMixinMongoose';
export default class CrawlTxService extends Service {
	private callApiMixin = new CallApiMixin().start();
	private redisMixin = new RedisMixin().start();

	private currentBlock = 0;

	public constructor(public broker: ServiceBroker) {
		super(broker);
		this.parseServiceSchema({
			name: 'crawltx',
			version: 1,
			mixins: [
				QueueService(
					`redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
					{
						prefix: 'crawl.block',
					},
				),
				this.callApiMixin,
				this.redisMixin,
                dbTransactionMixin,
			],
			queues: {
				'crawl.block': {
					concurrency: 1,
					async process(job: Job) {
						job.progress(10);
						// @ts-ignore
						await this.initEnv();
						// @ts-ignore
						await this.handleJob();
						job.progress(100);
						return true;
					},
				},
			},
		});
	}

	async handleJob() {
		const url = Utils.getUrlByChainIdAndType(Config.CHAIN_ID, URL_TYPE_CONSTANTS.RPC);
		const responseGetLatestBlock = await this.callApiFromDomain(
			url,
			`${Config.GET_LATEST_BLOCK_API}`,
		);
		const latestBlockNetwork = parseInt(responseGetLatestBlock.result.block.header.height);
		this.logger.info(`latestBlockNetwork: ${latestBlockNetwork}`);

		const startBlock = this.currentBlock + 1;

		let endBlock = startBlock + parseInt(Config.NUMBER_OF_BLOCK_PER_CALL) - 1;
		if (endBlock > latestBlockNetwork) {
			endBlock = latestBlockNetwork;
		}
		this.logger.info('startBlock: ' + startBlock + ' endBlock: ' + endBlock);
		try {
			let listPromise = [];
			for (let i = startBlock; i <= endBlock; i++) {
				listPromise.push(this.callApiFromDomain(url, `${Config.GET_BLOCK_BY_HEIGHT_API}${i}`));
			}
			let resultListPromise : ResponseFromRPC[] = await Promise.all(listPromise);
			
			let data : ResponseFromRPC = {
				id: '',
				jsonrpc: '',
				result: {
					blocks: resultListPromise.map( item => {return item.result}),
				}
			}
			// this.logger.info(data);
			// let data: ResponseFromRPC = await this.callApiFromDomain(
			// 	url,
			// 	`${Config.GET_BLOCK_API}\"block.height >= ${startBlock} AND block.height <= ${endBlock}\"&order_by="asc"&per_page=${Config.NUMBER_OF_BLOCK_PER_CALL}`,
			// );
			if (data == null) {
				throw new Error('cannot crawl block');
			}
			this.handleListBlock(data);
			this.currentBlock = endBlock;
			let redisClient: RedisClientType = await this.getRedisClient();
			redisClient.set(Config.REDIS_KEY_CURRENT_BLOCK, this.currentBlock);
		} catch (error) {
			this.logger.error(error);
			throw new Error('cannot crawl block');
		}
	}
	async handleListBlock(data: ResponseFromRPC) {
		const listBlock: BlockResponseFromLCD = data.result;
		listBlock.blocks.map((block: IBlock) => {
			//pust block to redis stream
			this.logger.info('xadd block: ' + block?.block?.header?.height);

			this.redisClient.sendCommand([
				'XADD',
				Config.REDIS_STREAM_BLOCK_NAME,
				'*',
				'element',
				JSON.stringify(block),
			]);
		});
	}
	
	async _start() {
		this.redisClient = await this.getRedisClient();
		let listAddress = [
        'aura1gw0p2s5434a5xfazwc4lumynk42vkzlrja0em7',
        'aura1cnek7mpunxssseelej2h5va4delkjwwsddu5qd',
        'aura1p4yjt4n900e8enlpp47lly006pp9jljl4rzclm',
        'aura1hyn6hnwmuueevz2xfp8jmhaszsvvfuwn5u5ly9',
        'aura159af5m82ea5w3qgnnm4w6aemc4krq4zehr8nj6',
        'aura1cmhuh7n6kf0ejxm6w7andpcyhyx5nzcpq67c3d',
        'aura1rfl8xmz6p2zfgyv94gmcc6yk0jg34j7k6ckuvc',
        'aura14m6x5pmf2k0cq73nrnu3gmus04uylel970j80c',
        'aura1u9vxwlnhhcwupwul5ejs5cpnxlg5yhmmm9l05q',
        'aura15hw2uaq8qe5g7y347u4p506fektcymkdyg79mm',
        'aura14qul7hpvkp0kj59xskn3gzpskmh8r5mq9pqnrk',
        'aura12q69u0wu45dp0m9j53wmgcs2rmnaara9tv0tw5',
        'aura1ysfycalvgne6enqp6jy3lhpsvc5cayul7m3s38',
        'aura13nmrlzy08qnxly57xyl359a0ly242nkujeysy9',
        'aura13t9a7kpezmrtn3plsz3pz6nyywcvfyyh9thw5j',
        'aura1m8ejpzpwkxcwxwy34zq95calm83xj6y6pced02',
        'aura164mgp63c4y9h2em9j0nfh4q3ju0hdf33xh9cmp',
        'aura1np96rzugs3f2auhcu8vhqelst0lphldqy24c69',
        'aura1hhnzxh480h0e635x0f4sz8d509vx7ckp7e94m4',
        'aura1sxa5gxl3nynnn6cx2czlxqnld5e3v0vs8qnpdh',
        'aura1q8h3ektlzwuejrrk6yqjstxa4d0hqgptrn0rs8',
        'aura1f4qcc2lq8y64p4ju93j5mmes3t0hr7t0r0hhct',
        'aura1gxsz9ren00ax0eq8xqeredxdhpn6h3frd3jqy0',
        'aura14vtd6hqdyljj6vfhe7ag6mwpaw87vxnjf2m2g8',
        'aura16j7yy8w9n9epxydaalypg47lcm96v7ty9z9q4k',
        'aura1ctnty45uxyclkk2y5uc7y4sgjq6dfd68n0qv27',
        'aura15lwwumhj6wfntzqa7qhyyylhwz744zg62k3vm2',
        'aura15dmavnahzskv4f4rx8l7was4fpxdgls8nsfkxn',
        'aura1cler2uj32yg9xnehncss5qyuudls4mahtugrv3',
        'aura1tqzla3lchgz9tuqg453l6fc0m5r86nvqwdc5dn',
        'aura1g4n2a7q5mehdz0yur3h8tg9hnw0ysd7xppej2y',
        'aura1h6adxwmz38wuqfcthf5qh7egd6frfechsvvq9u',
        'aura1cf9htrhzh4wr6hzkghc0485pruu2ahu4mrhp2j',
        'aura1d9d7p57am3a7lapdwp6qsqrds66cqzk2rrmdq2',
        'aura170u3s0r4u942c4x2z7704z0j0kda0kef8lntam',
        'aura1qp3fnehx4y0lqt24mx7qd87cvanlc9h033cqtu',
        'aura1ykq4dlhujd72dykau0dzj38ej5edh4gprh7mfz',
        'aura1tnjtglz7rpfe42686nag8cakm3eaz6y5denk5q',
        'aura1qqeh20nlzwa4e6ehh2gu4k674uw5h4g3e9kq53',
        'aura14wzfxqy99k44ckdmvlkvfufu6e369h6chm55kv',
        'aura1snxzkdv07uwxh2xchcl64hzy8nzcnh4d3mhtgc',
        'aura1spnm98ytrgs9t8pm6ufnplhx5tgk0ssyv04yy8',
        'aura13j5q8mk3w5eu0h57hyx5ahcq6cpqkm83uxzmn3',
        'aura1stmeg4wk5ga0g7flgaa69w02620ujq98cjyqm3',
        'aura1zx4m8ky4uxzj6gc8h836kfquqtkcwx6cva6cds',
        'aura1nlq4zpvkgz369kysqkufmnhpye9x8dpsat2ac6',
        'aura1npzjeg2k02v38a5pq5veptwn2z8m28yvyjl0pj',
        'aura1husdzx4puavkxv9zpn5mhwsmtepte4phvkrvx3',
        'aura1qchcevmk0cuwu3ztc3k9xn6q2zfkkuc4w05fp4',
        'aura193vlfj5rwp03msj0rwl2yn2t4v38pznq5j0u4g',
        'aura1yrs8semtz6jxx593yss4dy8ymu6l2902777qlc',
        'aura1jsrq84a6zvgf90d4gjxft28cufed6sakj0xlt0',
        'aura12k0z284e64l93dhyqhnjdquvzdv6y980hamqhd',
        'aura1zx3c9az8rmvahn4y96lzgarh4twdv876t8yth9',
        'aura1q3a6fkh5n90mfk72mx9hf7e8wcvf28zsrmfh6r',
        'aura1xxn48zfuwed228py7x8w4cee3kw03rtkdqsg7z',
        'aura1ss53pnm5snclu7lj4g6e9rxlhfwnz025gtcm08',
        'aura1q4vjhgqpx5t4rvd9ne9e23peef2acnhva4ydcj',
        'aura1cr87jhfe2slctt23xyzk7m5yyqxnyr7xexmd6q',
        'aura1lwhdhju0qptp0r5nvsnx8at0qd3uhx6p24q0c3',
        'aura1naehrgqmw0zd7p450wra03rlf9kfjfy89mlemp',
        'aura1sdvhlj9tehnxpht3d4lm4ch97422ygkllwcu24',
        'aura1n8d45d0f2fvncsmqw3jhc805vtkm654k0ld3c6',
        'aura1rmkyc7h6sc3769au8qazjxxfem0j2cp39ndjmd',
        'aura15t6ngtmc0eyln37r3qm7p2h809el7j87cn7lq4',
        'aura1lkw0ejpfhuh6mw0452ckdz9wju8l2eeuza8h4q',
        'aura16fpvw0jrprp59h43hlc87d8euv2y4h75emv5sa',
        'aura15m4majl4f96j07rldkcduvtwtv9rzl95rkpsje',
        'aura1f8xfqdn3cvt2duzjpfteer8772fkj3zmcl4zlx',
        'aura10tvuuef9n8zn09u3qqf3l5wdhq9twkmq2786td',
        'aura1esv7zkmxhghyhc8sfcj27jgcn05ee5srcldw0e',
        'aura18va6cnnxrmvr5v2r67w7rwtrpgfpem6pv7l5nx',
        'aura1rpl537h749ugja20n0raysq43ptc005uzcs2t7',
        'aura1xw0k4a4slncpqhl3dsdwj0vcu56cvztlhh3zp8',
        'aura1fpdyamvgrsnud94y2zwjmstjggc6zvxmphcu7j',
        'aura1rlampv4xrugte0x40wjqfssjzx9450dgfrekqw',
        'aura1y8xujwtgtv654cgsj20knl72pulkyrpe0a3ayc',
        'aura1zcsmykewyuwr25d4egmjmvuc3xpf38fupunthq',
        'aura1uprye9vn4fmcpg00mcw09j00gtqp7aqp822h4p',
        'aura1xa2h00acfspc6dzaypdlvxg2y6pfguwtv6z642',
        'aura1a4vfd6ekevmjj5wg2ch4vz0g2e0rn3fftcpxy6',
        'aura1h4meqm8jzrn0rnmu3aflm7qezwjxv7m8dya3s2',
        'aura1pcr5hmsmdeg8dlvh68096ksz02c34kaxcq92yn',
        'aura19mfhlq33d3ku6x5hwmasshfgyfp054kvxvsvze',
        'aura1skus5wj36rvxrckafzm2frlgexy8r94j06znqr',
        'aura1xcnjks52z0zwz7dacjf9wur4car8cc0dt54z0f',
        'aura1fz8w7rsvg2tvcu9qqp9nrqvykmrpqwwc2wetwn',
        'aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5',
        'aura14fm25lq8fd0mhq5spe998xxdul85avk7r0ggcc',
        'aura1zhrstufvachxmddfscdchsyqvhwekuuxm7p3q4',
        'aura1hu6r4z4rhesd0667l5kw46wufzcxsn42f7852d',
        'aura18qmtey7f0f3rz6m5qrxwktcp6q87sjrntuzupy',
        'aura1ane8pxw30uuhml9tsd0tw6suulcgpqmsg47qcx',
        'aura1mc5vsguezh63450u505w73xepg0htfzx57v63q',
        'aura16yflnk4xcdujc6ma3f6lr2ypvnq05mn7sdycqn',
        'aura1r0pl9xvg3vqzfftgx45kgwd93u3edngwgchual',
        'aura1u7d93nhd47fx404ly48vahwyf30uv7uqp5kavh',
        'aura1efjm5a7mpqkkj598tft04rgvg0txp984r5j7lx',
        ];
        let url =  ["https://lcd.euphoria.aura.network"]
        let fromBlock = 660820;
        let toBlock = 674797
        let listResult: any[] = [];
        let query1 = {
            "tx_response.height": {$lte: toBlock, $gte: fromBlock},
            "custom_info.chain_id":"euphoria-1",
            'tx_response.events': {
                $elemMatch: {
                    type: 'transfer',
		            'attributes.key': toBase64(toUtf8('sender')),
		            'attributes.value': toBase64(toUtf8('abc')),
                },
            },
        }


        listAddress.forEach(async (address)=>{
            let query1 = {
                "tx_response.height": {$lte: toBlock, $gte: fromBlock},
                "custom_info.chain_id":"euphoria-1",
                'tx_response.events': {
                    $elemMatch: {
                        type: 'transfer',
                        'attributes.key': toBase64(toUtf8('sender')),
                        'attributes.value': toBase64(toUtf8(address)),
                    },
                },
            }
            let query2 = {
                "tx_response.height": {$lte: toBlock, $gte: fromBlock},
                "custom_info.chain_id":"euphoria-1",
                $and: [
                    {'tx_response.events':{
                        $elemMatch: {
                            type: 'transfer',
                            'attributes.key': toBase64(toUtf8('sender')),
                            'attributes.value': toBase64(toUtf8(address)),
                        },
                    }},
                    {'tx_response.events':{
                        $elemMatch: {
                            type: 'message',
                            'attributes.key': toBase64(toUtf8('action')),
                            'attributes.value': toBase64(toUtf8('/cosmos.staking.v1beta1.MsgBeginRedelegate')),
                        },
                    }}
                ]
            }
            let query3 = {
                "tx_response.height": {$lte: toBlock, $gte: fromBlock},
                "custom_info.chain_id":"euphoria-1",
                $and: [
                    {'tx_response.events':{
                        $elemMatch: {
                            type: 'transfer',
                            'attributes.key': toBase64(toUtf8('sender')),
                            'attributes.value': toBase64(toUtf8(address)),
                        },
                    }},
                    {'tx_response.events':{
                        $elemMatch: {
                            type: 'message',
                            'attributes.key': toBase64(toUtf8('action')),
                            'attributes.value': toBase64(toUtf8('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward')),
                        },
                    }}
                ]
            }



            //case 1
            // let pathAllSendTx = `/cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC`
            // let pathRedelegateTx = `/cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=message.action='/cosmos.staking.v1beta1.MsgBeginRedelegate'&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC`
            // let pathWithdraw = `/cosmos/tx/v1beta1/txs?events=tx.height>=${fromBlock}&events=tx.height<=${toBlock}&events=message.action='/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward'&events=transfer.sender='${address}'&pagination.offset=0&pagination.limit=1&pagination.count_total=true&order_by=ORDER_BY_DESC`;

            // let [result1, result2, result3] = await Promise.all([
            //     this.callApiFromDomain(
            //         url,
            //         pathAllSendTx,
            //     ),
            //     this.callApiFromDomain(
            //         url,
            //         pathRedelegateTx,
            //     ),this.callApiFromDomain(
            //         url,
            //         pathWithdraw,
            //     )
            // ])

            // let element = {
            //     address: address,
            //     noTx: result1.pagination.total,
            //     noRedelegate : result2.pagination.total,
            //     noWithdraw: result3.pagination.total,
            // }
            // listResult.push(element);
            // this.logger.info(result1.pagination.total,' ',result2.pagination.total,' ',result3.pagination.total,' ');


            //case 2
            this.logger.info(query1);
            // let result1: number = await this.adapter.count({query: query1});
            // let result2: number = await this.adapter.count({query: query2});
            // let result3: number = await this.adapter.count({query: query3});
            let [result1, result2, result3] = await Promise.all([
                this.adapter.count({query: query1}),
                this.adapter.count({query: query2}),
                this.adapter.count({query: query3})
            ])
             let element = {
                address: address,
                noTx: result1,
                noRedelegate : result2,
                noWithdraw: result3,
            }
            listResult.push(element);
            this.logger.info(address,' ',result1,' ',result2,' ',result3,' ');
        })
        this.logger.info(JSON.stringify(listResult));
		this.getQueue('crawl.block').on('completed', (job: Job) => {
			this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
		});
		this.getQueue('crawl.block').on('failed', (job: Job) => {
			this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
		});
		this.getQueue('crawl.block').on('progress', (job: Job) => {
			this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
		});
		return super._start();
	}
    async sleep(ms: any) {
        return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

    }
    
}
