'use strict';
const _ 		= require("lodash");
const MongooseDbAdapter = require("../customMongooseAdapter2");

class CustomMongooseDbAdapter extends MongooseDbAdapter {
    aggregate(param){
        return this.model.aggregate(param);
    }

    hydrate(doc){
        return this.model.hydrate(doc);
    }

    countWithSkipLimit(query){
        let cursor = this.createCursor(query).countDocuments(true);
        return cursor.exec();
    }

    findByIdAndUpdate(query){
        return this.model.findByIdAndUpdate(query.id, query.update, { new: true }).exec();
    }

    bulkWrite(query){
        return this.model.bulkWrite(query);
    }

    lean(filters) {
		return this.createCustomCursor(filters).lean();
	}

    /**
	 * Create a filtered query
	 * Available filters in `params`:
	 *  - search
	 * 	- sort
	 * 	- limit
	 * 	- offset
	 *  - query
	 *
 	 * @param {Object} params
	 * @returns {MongoQuery}
	 */
	createCustomCursor(params) {
		if (params) {
			const q = this.model.find(params.query, params.projection);

			// Search
			if (_.isString(params.search) && params.search !== "") {
				if (params.searchFields && params.searchFields.length > 0) {
					const searchQuery = {
						$or: params.searchFields.map(f => (
							{
								[f]: new RegExp(_.escapeRegExp(params.search), "i")
							}
						))
					};
					const query = q.getQuery();
					if (query.$or) {
						if (!Array.isArray(query.$and)) query.$and = [];
						query.$and.push(
							_.pick(query, "$or"),
							searchQuery
						);
						q.setQuery(_.omit(query, "$or"));
					} else {
						q.find(searchQuery);
					}
				} else {
					// Full-text search
					// More info: https://docs.mongodb.com/manual/reference/operator/query/text/
					q.find({
						$text: {
							$search: params.search
						}
					});
					q._fields = {
						_score: {
							$meta: "textScore"
						}
					};
					q.sort({
						_score: {
							$meta: "textScore"
						}
					});
				}
			}

			// Sort
			if (_.isString(params.sort))
				q.sort(params.sort.replace(/,/, " "));
			else if (Array.isArray(params.sort))
				q.sort(params.sort.join(" "));

			// Offset
			if (_.isNumber(params.offset) && params.offset > 0)
				q.skip(params.offset);

			// Limit
			if (_.isNumber(params.limit) && params.limit > 0)
				q.limit(params.limit);

			return q;
		}
		return this.model.find();
	}
}

module.exports = CustomMongooseDbAdapter;