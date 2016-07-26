var express = require('express'),
    router = express.Router(),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert');

router.post('/movies', function (req, res) {
  MongoClient.connect('mongodb://localhost:27017/movies', function (err, db) {
    if (err) throw err;

    db.collection('entries').insertOne(req.body);
  })
});

module.exports = router;