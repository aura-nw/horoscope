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

                        let listParamUri = [`mongodb://`];
                        if (Config.DB_GENERIC_USER && Config.DB_GENERIC_PASSWORD){
                            listParamUri.push(`${Config.DB_GENERIC_USER}:${encodeURIComponent(Config.DB_GENERIC_PASSWORD)}@`)
                        }
                        listParamUri.push(`${Config.DB_GENERIC_HOST}:${Config.DB_GENERIC_PORT}/?retryWrites=${Config.DB_GENERIC_RETRY_WRITES}`)
                        if (Config.DB_GENERIC_REPLICA_SET && Config.DB_GENERIC_READ_PREFERENCE) {
                            listParamUri.push(`&replicaSet=${Config.DB_GENERIC_REPLICA_SET}&readPreference=${Config.DB_GENERIC_READ_PREFERENCE}`);
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