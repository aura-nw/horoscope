import RedisMixin from "../../mixins/redis/redis.mixin";
import { Service, ServiceBroker } from "moleculer";
import { Config } from "../../common";
import { dbAccountAuthMixin, dbAccountDelegationsMixin } from "../../mixins/dbMixinMongoose";
import { Job } from "bull";
import { CONST_CHAR, LIST_NETWORK } from "../../common/constant";
import { ListTxCreatedParams } from "../../types";
const QueueService = require('moleculer-bull');
const knex = require('../../config/database');

export default class IndexDelegatorsService extends Service {
    private redisMixin = new RedisMixin().start();
    public constructor(public broker: ServiceBroker) {
        super(broker);
        this.parseServiceSchema({
            name: 'indexDelegators',
            version: 1,
            mixins: [
                QueueService(
                    `redis://${Config.REDIS_USERNAME}:${Config.REDIS_PASSWORD}@${Config.REDIS_HOST}:${Config.REDIS_PORT}/${Config.REDIS_DB_NUMBER}`,
                    {
                        prefix: 'index.delegators',
                    },
                ),
                dbAccountDelegationsMixin,
                // dbAccountAuthMixin,
                this.redisMixin,
            ],
            queues: {
                'index.delegators': {
                    concurrency: 10,
                    process(job: Job) {
                        job.progress(10);
                        // @ts-ignore
                        this.handleJob();
                        job.progress(100);
                        return true;
                    },
                },
            },
        });
    }

    async handleJob() {
        const listAddresses = [
            "aura189ty8nanmvfsjmsgd0f0cvpnzj9ace3etft93q",
            "aura16tm055dn07prysr0yht5z467225n52aflq8a4u",
            "aura150zhsrpv5sgnhyvdw3xamc24xmvupajlctwy7l",
            "aura19agdjkr2vwz4qws98p9va9u9f0p0fcttq8d6ed",
            "aura1jc5c2x4ygpztn3mv9ptxsurl0czm47ccl8fe5a",
            "aura1lm8fkt6gplhq6uqmu0fxkk6amvujweh5nd63sq",
            "aura1txyhhtueazwxu5p0rn06gp7spxtg8cetfef8xa",
            "aura1m9uf90hagnr0azs88vlfp83twm4cyhkfdcjxhe",
            "aura1303lwps2jz9dk5eapd6fpgs0ftrc3cd8m99t7r",
            "aura1htrgaq0j6q34gmlhy88h3sg7detc8mrja5ycpa",
            "aura1fgxl5a4e08yv79k5mfy83y55sne38maafeks69",
            "aura132ylqzudwd68hx8a7jwz475q774xkxvx7llg9d",
            "aura1c3egxfp0wj6k3dmjch6dr5vmuevs5jtajm9g0e",
            "aura1chqwklsqsmvxfn0jhh3m7crv6j4kg2z0wzlsq3",
            "aura13gx2s6hzs2sf7j0syrf20070lzgwd2znjfjhdw",
            "aura1r2d4ezghfp8gl9k7aam7puypv4793tlmfpm0lv",
            "aura1pfkjrnsch83dg029dz5px79g9hpdj73eh0pv0u",
            "aura10dpsdmx2jm32fe4sudg79l9jrh5aep8l28yq2d",
            "aura1v2pakpgldpsfpz25kfnvan9nnz6zd9w5zks49d",
            "aura1a4axhr6xpwhm5kr4g4ewlshu68ngx89emtxgfp",
            "aura17df8n980tjyes7pzu0vedjqe6tpynjjzw9xkyx",
            "aura13kncgv2q6fc3lf840xc53jnzvcxena4a5guelp",
            "aura1w8m74hhh7ec4aanrt8n9clw3fm8rk7uzn9s8lq",
            "aura1gw0p2s5434a5xfazwc4lumynk42vkzlrja0em7",
            "aura1cnek7mpunxssseelej2h5va4delkjwwsddu5qd",
            "aura1p4yjt4n900e8enlpp47lly006pp9jljl4rzclm",
            "aura1hyn6hnwmuueevz2xfp8jmhaszsvvfuwn5u5ly9",
            "aura159af5m82ea5w3qgnnm4w6aemc4krq4zehr8nj6",
            "aura1cmhuh7n6kf0ejxm6w7andpcyhyx5nzcpq67c3d",
            "aura1rfl8xmz6p2zfgyv94gmcc6yk0jg34j7k6ckuvc",
            "aura14m6x5pmf2k0cq73nrnu3gmus04uylel970j80c",
            "aura1u9vxwlnhhcwupwul5ejs5cpnxlg5yhmmm9l05q",
            "aura15hw2uaq8qe5g7y347u4p506fektcymkdyg79mm",
            "aura14qul7hpvkp0kj59xskn3gzpskmh8r5mq9pqnrk",
            "aura12q69u0wu45dp0m9j53wmgcs2rmnaara9tv0tw5",
            "aura1ysfycalvgne6enqp6jy3lhpsvc5cayul7m3s38",
            "aura13nmrlzy08qnxly57xyl359a0ly242nkujeysy9",
            "aura13t9a7kpezmrtn3plsz3pz6nyywcvfyyh9thw5j",
            "aura1m8ejpzpwkxcwxwy34zq95calm83xj6y6pced02",
            "aura164mgp63c4y9h2em9j0nfh4q3ju0hdf33xh9cmp",
            "aura1np96rzugs3f2auhcu8vhqelst0lphldqy24c69",
            "aura1hhnzxh480h0e635x0f4sz8d509vx7ckp7e94m4",
            "aura1sxa5gxl3nynnn6cx2czlxqnld5e3v0vs8qnpdh",
            "aura1q8h3ektlzwuejrrk6yqjstxa4d0hqgptrn0rs8",
            "aura1f4qcc2lq8y64p4ju93j5mmes3t0hr7t0r0hhct",
            "aura1gxsz9ren00ax0eq8xqeredxdhpn6h3frd3jqy0",
            "aura14vtd6hqdyljj6vfhe7ag6mwpaw87vxnjf2m2g8",
            "aura16j7yy8w9n9epxydaalypg47lcm96v7ty9z9q4k",
            "aura1ctnty45uxyclkk2y5uc7y4sgjq6dfd68n0qv27",
            "aura15lwwumhj6wfntzqa7qhyyylhwz744zg62k3vm2",
            "aura15dmavnahzskv4f4rx8l7was4fpxdgls8nsfkxn",
            "aura1cler2uj32yg9xnehncss5qyuudls4mahtugrv3",
            "aura1tqzla3lchgz9tuqg453l6fc0m5r86nvqwdc5dn",
            "aura1g4n2a7q5mehdz0yur3h8tg9hnw0ysd7xppej2y",
            "aura1h6adxwmz38wuqfcthf5qh7egd6frfechsvvq9u",
            "aura1cf9htrhzh4wr6hzkghc0485pruu2ahu4mrhp2j",
            "aura1d9d7p57am3a7lapdwp6qsqrds66cqzk2rrmdq2",
            "aura170u3s0r4u942c4x2z7704z0j0kda0kef8lntam",
            "aura1qp3fnehx4y0lqt24mx7qd87cvanlc9h033cqtu",
            "aura1ykq4dlhujd72dykau0dzj38ej5edh4gprh7mfz",
            "aura1tnjtglz7rpfe42686nag8cakm3eaz6y5denk5q",
            "aura1qqeh20nlzwa4e6ehh2gu4k674uw5h4g3e9kq53",
            "aura14wzfxqy99k44ckdmvlkvfufu6e369h6chm55kv",
            "aura1snxzkdv07uwxh2xchcl64hzy8nzcnh4d3mhtgc",
            "aura1spnm98ytrgs9t8pm6ufnplhx5tgk0ssyv04yy8",
            "aura13j5q8mk3w5eu0h57hyx5ahcq6cpqkm83uxzmn3",
            "aura1stmeg4wk5ga0g7flgaa69w02620ujq98cjyqm3",
            "aura1zx4m8ky4uxzj6gc8h836kfquqtkcwx6cva6cds",
            "aura1nlq4zpvkgz369kysqkufmnhpye9x8dpsat2ac6",
            "aura1npzjeg2k02v38a5pq5veptwn2z8m28yvyjl0pj",
            "aura1husdzx4puavkxv9zpn5mhwsmtepte4phvkrvx3",
            "aura1qchcevmk0cuwu3ztc3k9xn6q2zfkkuc4w05fp4",
            "aura193vlfj5rwp03msj0rwl2yn2t4v38pznq5j0u4g",
            "aura1yrs8semtz6jxx593yss4dy8ymu6l2902777qlc",
            "aura1jsrq84a6zvgf90d4gjxft28cufed6sakj0xlt0",
            "aura12k0z284e64l93dhyqhnjdquvzdv6y980hamqhd",
            "aura1zx3c9az8rmvahn4y96lzgarh4twdv876t8yth9",
            "aura1q3a6fkh5n90mfk72mx9hf7e8wcvf28zsrmfh6r",
            "aura1xxn48zfuwed228py7x8w4cee3kw03rtkdqsg7z",
            "aura1ss53pnm5snclu7lj4g6e9rxlhfwnz025gtcm08",
            "aura1q4vjhgqpx5t4rvd9ne9e23peef2acnhva4ydcj",
            "aura1cr87jhfe2slctt23xyzk7m5yyqxnyr7xexmd6q",
            "aura1lwhdhju0qptp0r5nvsnx8at0qd3uhx6p24q0c3",
            "aura1naehrgqmw0zd7p450wra03rlf9kfjfy89mlemp",
            "aura1sdvhlj9tehnxpht3d4lm4ch97422ygkllwcu24",
            "aura1n8d45d0f2fvncsmqw3jhc805vtkm654k0ld3c6",
            "aura1rmkyc7h6sc3769au8qazjxxfem0j2cp39ndjmd",
            "aura15t6ngtmc0eyln37r3qm7p2h809el7j87cn7lq4",
            "aura1lkw0ejpfhuh6mw0452ckdz9wju8l2eeuza8h4q",
            "aura16fpvw0jrprp59h43hlc87d8euv2y4h75emv5sa",
            "aura15m4majl4f96j07rldkcduvtwtv9rzl95rkpsje",
            "aura1f8xfqdn3cvt2duzjpfteer8772fkj3zmcl4zlx",
            "aura10tvuuef9n8zn09u3qqf3l5wdhq9twkmq2786td",
            "aura1esv7zkmxhghyhc8sfcj27jgcn05ee5srcldw0e",
            "aura18va6cnnxrmvr5v2r67w7rwtrpgfpem6pv7l5nx",
            "aura1rpl537h749ugja20n0raysq43ptc005uzcs2t7",
            "aura1xw0k4a4slncpqhl3dsdwj0vcu56cvztlhh3zp8",
            "aura1fpdyamvgrsnud94y2zwjmstjggc6zvxmphcu7j",
            "aura1rlampv4xrugte0x40wjqfssjzx9450dgfrekqw",
            "aura1y8xujwtgtv654cgsj20knl72pulkyrpe0a3ayc",
            "aura1zcsmykewyuwr25d4egmjmvuc3xpf38fupunthq",
            "aura1uprye9vn4fmcpg00mcw09j00gtqp7aqp822h4p",
            "aura1xa2h00acfspc6dzaypdlvxg2y6pfguwtv6z642",
            "aura1a4vfd6ekevmjj5wg2ch4vz0g2e0rn3fftcpxy6",
            "aura1h4meqm8jzrn0rnmu3aflm7qezwjxv7m8dya3s2",
            "aura1pcr5hmsmdeg8dlvh68096ksz02c34kaxcq92yn",
            "aura19mfhlq33d3ku6x5hwmasshfgyfp054kvxvsvze",
            "aura1skus5wj36rvxrckafzm2frlgexy8r94j06znqr",
            "aura1xcnjks52z0zwz7dacjf9wur4car8cc0dt54z0f",
            "aura1fz8w7rsvg2tvcu9qqp9nrqvykmrpqwwc2wetwn",
            "aura15f6wn3nymdnhnh5ddlqletuptjag09tryrtpq5",
            "aura14fm25lq8fd0mhq5spe998xxdul85avk7r0ggcc",
            "aura1zhrstufvachxmddfscdchsyqvhwekuuxm7p3q4",
            "aura1hu6r4z4rhesd0667l5kw46wufzcxsn42f7852d",
            "aura18qmtey7f0f3rz6m5qrxwktcp6q87sjrntuzupy",
            "aura1ane8pxw30uuhml9tsd0tw6suulcgpqmsg47qcx",
            "aura1mc5vsguezh63450u505w73xepg0htfzx57v63q",
            "aura16yflnk4xcdujc6ma3f6lr2ypvnq05mn7sdycqn",
            "aura1r0pl9xvg3vqzfftgx45kgwd93u3edngwgchual",
            "aura1u7d93nhd47fx404ly48vahwyf30uv7uqp5kavh",
            "aura1efjm5a7mpqkkj598tft04rgvg0txp984r5j7lx",
        ];
        let listValidators = [
            { title: "OnBlock Ventures", address: "auravaloper1pxl99s8h4g5mg564zrp4qz9k8h64l24fj0tyqy" },
            { title: "VandaCapital", address: "auravaloper1pwxv75q7e90u4vcx68x5q6j3kjlcdv0mkt04w8" },
            { title: "Validatrium", address: "auravaloper1p55dyaekk77m5l08kjj5fyyhjdln74ly6sx7fs" },
            { title: "Nochance | MMS", address: "auravaloper1zdrahpddwl893lytke8sdmd6gmxyxk7umrahwj" },
            { title: "kooltek68", address: "auravaloper19sy3unaptymcezquuvu2h8rqpnkyumczt5f8ss" },
            { title: "BVS", address: "auravaloper19377zr3ndq97w3l95dna0w0du2q7rg9mrtp8pg" },
            { title: "TC Network", address: "auravaloper1x974kw0xsasgr574h9vpaggg8dhn7yxgjmawye" },
            { title: "Erialos The Silver Fox", address: "auravaloper18yrv3rpp2ljcnupa0jm6aa9hnaygju7tymv2hm" },
            { title: "OranG3cluB", address: "auravaloper18hwyfytvjcuh7jkh4ue9n60h24xp7tnwvqxvry" },
            { title: "Staketab", address: "auravaloper18mlzkmmnuk4t44s52ulex070tc7xyrrmmw97y5" },
            { title: "StakeAngle", address: "auravaloper1gc9pl2tahp2zld2jxc3x6ezsq9hwssgjr089mx" },
            { title: "klever", address: "auravaloper1gajypp5e2upfpqk3mglv0melmv0cesnlmlajtr" },
            { title: "FreshAura", address: "auravaloper1frassqpr38q6u0tajrrwmh2xjny3tmvv073c80" },
            { title: "Yurbason", address: "auravaloper1f9xys48drykvte7gljgl4rymmaps7pj3vv4aey" },
            { title: "STAVR", address: "auravaloper1f4p75whmt2my5y0xs5zdzwvrzzf0e2jputw2my" },
            { title: "Moonlet", address: "auravaloper123c5zy7r2q6cx6s40yrvx2k33rnm8jtshgrxpj" },
            { title: "2xStake.com", address: "auravaloper1vz3d2e088f3ln57gc788m0stgpkdvvw8hauwaj" },
            { title: "[NODERS]TEAM", address: "auravaloper1vvqz6j3ucxr6n0ejdz4ck602lnyjew93cgcw4m" },
            { title: "Soteria Trust", address: "auravaloper1dh20eeewmedtgkrgqcnq7ey63t533sj4tyntxd" },
            { title: "BotDotNet", address: "auravaloper1wxzxaq0p235yjsstwtf82pnl78kw9ap7knwk66" },
            { title: "azstake", address: "auravaloper1wdw08fefy0jzxn5q6yfv0u6sf0zw94wxqak9dr" },
            { title: "Stake-Take", address: "auravaloper1wkpfyw4cutnh86jr987nqjzyh2e5far6dszelv" },
            { title: "lesnik_utsa", address: "auravaloper10fucc0hfsj524p5d8ve0xq3rxzaqjzcujh0fl5" },
            { title: "AlxVoy", address: "auravaloper10dpsdmx2jm32fe4sudg79l9jrh5aep8l344gjn" },
            { title: "SerGo", address: "auravaloper103f9xxjj9938dh9ghxtet53cat4dl42k357k8y" },
            { title: "grin", address: "auravaloper1sdu757gajhhzzyda0dxfpzu53ylsjqj5xdfdhu" },
            { title: "Noderunners", address: "auravaloper13xz8atkrfwq2664a25gdxkkk75g8zq5f20gs8m" },
            { title: "Red thunder - node runner", address: "auravaloper1jnrz5d8lufm4zjqr5lsnhj32dhq8s3d0rj4d04" },
            { title: "P-OPS Team", address: "auravaloper1jkg7cvzwlapasg6zkf8gpc28lt25hgyfj63vt7" },
            { title: "staking4all", address: "auravaloper1jk44z7eug6h64n8s4txdpvlqn4yuqj329sge7s" },
            { title: "Palamar", address: "auravaloper1nz98ds0qle7ypcdc4lsp4sa6z0a9lrawwaarxv" },
            { title: "TienThuatToan Capital", address: "auravaloper1nynpwwc2x5g4fdve7ldxw4xvu9ygchd88rfaj2" },
            { title: "goto5k", address: "auravaloper1na3vztra9qtlwexm8580c37f4psypr9sld9wnd" },
            { title: "Vault Staking", address: "auravaloper15d8pcscam93rwe8q3ymsgkeh349x2w9fypnpun" },
            { title: "stakr.space", address: "auravaloper1hpd5sq6p27d7vf4cpfex5m0r5evjp3jqckwsm3" },
            { title: "kjnodes", address: "auravaloper1h2ney6qyfpz948nt8he834tvudqrdeurm40whh" },
            { title: "owlstake", address: "auravaloper1hse42mechx4442edw9pfgny2r75cznthqlcl66" },
            { title: "AVIAONE", address: "auravaloper1hell62gp8j6anrd5r4hc07m9gx5jyz7w09f9z3" },
            { title: "Darvin", address: "auravaloper1cjp2ja36z9tdaa0l37ypkzz2vaxh24lfe2raql" },
            { title: "web34ever", address: "auravaloper1clwszjl2m0zjpu94lyzx8lpmzdv8vgv39xctwk" },
            { title: "NodeStake", address: "auravaloper1etx55kw7tkmnjqz0k0mups4ewxlr324t43n9yp" },
            { title: "ramuchi.tech", address: "auravaloper1et5m3tw02cf3ttym6tyctvs5j85gy3rrehjq9z" },
            { title: "dreamstaker", address: "auravaloper1ev9ze3szt5335r24rgaehgzstv2vschnvjs9we" },
            { title: "SGTstake", address: "auravaloper1e37daa8qtlzww9xekz9ly6ups4les49lka9dkt" },
            { title: "Illuminati", address: "auravaloper1eew8ctrrt5uwvlcnnc7razenv49zc27rleda3k" },
            { title: "Enigma", address: "auravaloper1607vg5s8dmmsvgghq9rw8w74u0lgcaam2cdgsj" },
            { title: "StingRay", address: "auravaloper1up3cnxcs6krcxzmp5rzcsz85djerxvu5zg2gms" },
            { title: "silent", address: "auravaloper1ahkajf6wfkzh3mzn0wf0wxugg2rntgcmglxuyx" },
            { title: "MinatoFund", address: "auravaloper17rm2mpzmgqqfm0jvyt6j0lq4vysyvqcgm7dypp" },
            { title: "lkskrn", address: "auravaloper18udxtfaemz8rc6g5qjamur4kxkp72egv3723nk" },
            { title: "-STAKECRAFT-", address: "auravaloper1my2s84cetqudfswymd5dwngh808xpzev9zm5sp" },
        ];
        const vote_counts = await knex('validators')
            .select('validators.operator_address')
            .count('proposal_votes.proposal_id as vote_count')
            .join('proposal_votes', 'validators.acc_address', '=', 'proposal_votes.voter')
            .where('proposal_votes.proposal_id', '!=', '1')
            .where({
                'proposal_votes.option': 'VOTE_OPTION_YES',
            })
            .groupBy('validators.operator_address');
        const total_votes = (await knex('proposals').count('pro_id as proposals'))[0].proposals - 1;
        for (let validator of listValidators) {
            const vote_count = vote_counts.find((v: any) => v.operator_address === validator.address).vote_count;
            const addresses: number = await this.adapter.count({
                query: {
                    address: {
                        $in: listAddresses
                    },
                    'delegation_responses.delegation.validator_address': validator.address,
                    'custom_info.chain_id': 'euphoria-1'
                }
            });
            console.log(`${validator.title},${validator.address},${addresses},${vote_count}/${total_votes}`);
        };

        // const listVestingAccounts = await this.adapter.find({
        //     query: {
        //         'account.result.type': {
        //             $in: [
        //                 'cosmos-sdk/ContinuousVestingAccount',
        //                 'cosmos-sdk/PeriodicVestingAccount',
        //                 'cosmos-sdk/DelayedVestingAccount'
        //             ]
        //         }
        //     },
        // });
        // LIST_NETWORK.map((network) => {
        //     this.broker.emit('list-tx.upsert', {
        //         listTx: listVestingAccounts.filter((v: any) => v.custom_info.chain_id === network.chainId),
        //         source: CONST_CHAR.API,
        //         chainId: network.chainId,
        //     } as ListTxCreatedParams);
        // });
    }

    async _start() {
        this.redisClient = await this.getRedisClient();
        this.createJob(
            'index.delegators',
            {
                removeOnComplete: true,
            },
        );
        this.getQueue('index.delegators').on('completed', (job: Job) => {
            this.logger.info(`Job #${job.id} completed!, result: ${job.returnvalue}`);
        });
        this.getQueue('index.delegators').on('failed', (job: Job) => {
            this.logger.error(`Job #${job.id} failed!, error: ${job.stacktrace}`);
        });
        this.getQueue('index.delegators').on('progress', (job: Job) => {
            this.logger.info(`Job #${job.id} progress: ${job.progress()}%`);
        });
        return super._start();
    }
}