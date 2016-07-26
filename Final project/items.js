var MongoClient = require('mongodb').MongoClient, assert = require('assert');

function ItemDAO(database) {
    "use strict";

    this.db = database;
    this.getCategories = function(callback) {
        var collection = this.db.collection('item');
        var cursor = collection.aggregate([
          { $group: { _id: "$category", num: { $sum: 1 } } },
          { $sort : { _id: 1 } }
        ]);

        cursor.toArray(function(err, categories) {
            var total = categories.reduce(function(sum, doc) {
                return sum + doc.num;
            }, 0);
            categories.unshift({ _id: 'All', num: total });
            callback(categories);
        });
    }

    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";

        var phases = [
            { $sort : { _id: 1 } },
            { $skip: page * itemsPerPage },
            { $limit: itemsPerPage }
        ];

        var collection = this.db.collection('item');
        var cursor = collection.aggregate(phases);

        if (category !== 'All') {
            phases.unshift({ $match: { category: category } });
        }

        cursor.toArray(function(err, pageItems) {
            callback(pageItems);
        });
    }

    this.getNumItems = function(category, callback) {
        "use strict";

        var collection = this.db.collection('item');
        var cursor = collection.aggregate([
            {
                $group:
                {
                    _id: "$category",
                    count: { $sum: 1 }
                }

            }
        ]);

        cursor.toArray(function(err, categories) {
            var total = categories.reduce(function(sum, item) {
                if (item._id === 'All') sum += item.count;
                if (item._id === category) sum += item.count;

                return sum;
            }, 0);

            callback(total);
        });
    }

    this.searchItems = function(query, page, itemsPerPage, callback) {
        "use strict";

        var collection = this.db.collection('item');
        var cursor = collection.aggregate([
            {
                $match: {
                    $text: { $search: query.trim() }
                }
            },
            { $sort: { _id: 1 } },
            { $skip: page * itemsPerPage },
            { $limit: itemsPerPage }
        ]);

        cursor.toArray(function(err, items) {
            callback(items);
        });
    }

    this.getNumSearchItems = function(query, callback) {
        "use strict";

        var numItems = 0;

        var collection = this.db.collection('item');
        var cursor = collection.aggregate([
            {
                $match: {
                    $text: { $search: query.trim() }
                }
            },
            { $sort: { _id: 1 } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        cursor.toArray(function(err, items) {
            callback(items[0].count);
        });
    }

    this.getItem = function(itemId, callback) {
        "use strict";

        var collection = this.db.collection('item');
        var cursor = collection.aggregate([ {
            $match: { _id: itemId }
        } ]);

        cursor.toArray(function(err, item) {
            callback(item[0]);
        });
    }

    this.getRelatedItems = function(callback) {
        "use strict";

        this.db.collection("item").find({})
            .limit(4)
            .toArray(function(err, relatedItems) {
                assert.equal(null, err);
                callback(relatedItems);
            });
    };

    this.addReview = function(itemId, comment, name, stars, callback) {
        "use strict";

        this.db.collection("item").findOneAndUpdate(
            { _id: itemId },
            {
                $push: {
                    reviews: {
                        name: name,
                        comment: comment,
                        stars: stars,
                        date: Date.now()
                    }
                }
            },
            {
              returnOriginal: false
            }
        ).then(function(doc) {
            callback(doc);
        });
    }

    this.createDummyItem = function() {
        "use strict";

        var item = {
            _id: 1,
            title: "Gray Hooded Sweatshirt",
            description: "The top hooded sweatshirt we offer",
            slogan: "Made of 100% cotton",
            stars: 0,
            category: "Apparel",
            img_url: "/img/products/hoodie.jpg",
            price: 29.99,
            reviews: []
        };

        return item;
    }
}

module.exports.ItemDAO = ItemDAO;
