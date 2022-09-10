import { Config } from "../../common";
import { ServiceSchema, Service } from "moleculer";
const mongo = require('mongodb');

export default class MongoDBMixin implements Partial<ServiceSchema>, ThisType<Service> {
    private schema: Partial<ServiceSchema> & ThisType<Service>;

    public constructor() {
        this.schema = {
            methods: {
                async connectToDB() {
                    if (this.mongoDBClient === undefined) {

                        let listParamUri = [`${this.dbInfo.dialect}://`];
                        if (this.dbInfo.user && this.dbInfo.password){
                            listParamUri.push(`${this.dbInfo.user}:${this.dbInfo.password}@`)
                        }
                        listParamUri.push(`${this.dbInfo.host}:${this.dbInfo.port}/?retryWrites=${this.dbInfo.retryWrites}`)
                        if (this.dbInfo.replicaSet != '') {
                            listParamUri.push(`&replicaSet=${this.dbInfo.replicaSet}&readPreference=${this.dbInfo.readPreference}`);
                        }
                        let uri = listParamUri.join('');
                        this.mongoDBClient = await mongo.MongoClient.connect(
                            uri,
                        );
                    }
                    return this.mongoDBClient;
                }
            },
        };
    }

    public start() {
        return this.schema;
    }
}

export const mongoDBMixin = new MongoDBMixin().start();