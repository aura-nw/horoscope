const MongooseDbAdapter = require("moleculer-db-adapter-mongoose");

class CustomMongooseDbAdapter extends MongooseDbAdapter {
    aggregate(param){
        return this.model.aggregate(param);
    }

    hydrate(doc){
        return this.model.hydrate(doc);
    }

    countWithSkipLimit(query){
        let cursor = this.createCursor(query).count(true);
        return cursor.exec();
    }
}

module.exports = CustomMongooseDbAdapter;