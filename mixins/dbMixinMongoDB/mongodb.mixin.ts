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
                        let uri = '';
                        if (Config.DB_GENERIC_USER && Config.DB_GENERIC_PASSWORD){
                            uri = `mongodb://${Config.DB_GENERIC_USER}:${encodeURIComponent(Config.DB_GENERIC_PASSWORD)}@${Config.DB_GENERIC_HOST}:${Config.DB_GENERIC_PORT}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
                        }else{
                            uri = `mongodb://${Config.DB_GENERIC_HOST}:${Config.DB_GENERIC_PORT}/?replicaSet=rs0&readPreference=secondaryPreferred&retryWrites=false`;
                        }
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